import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline'
import { Construct } from '@aws-cdk/core'
import { Bucket } from '@aws-cdk/aws-s3'
import {
  S3SourceAction,
  CodeBuildAction,
  S3Trigger
} from '@aws-cdk/aws-codepipeline-actions'
import StageName from './stage-name'
import { ModuleDeployProject } from './projects/module-deploy-project'
import { ModuleBuildProject } from './projects/module-build-project'
import { Role } from '@aws-cdk/aws-iam'
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'
import { projectEnvironmentVars } from './projects/project-environment'
import config from '../config'

export interface ModulePipelineProps {
  artifactsBucket: Bucket
  stageName: StageName
  moduleName: string
  moduleBuildProject: ModuleBuildProject
  moduleDeployProject: ModuleDeployProject
  pipelineRole: Role
}

export class ModulePipeline extends Pipeline {
  constructor(scope: Construct, id: string, props: ModulePipelineProps) {
    const {
      artifactsBucket,
      moduleName,
      stageName,
      moduleBuildProject,
      moduleDeployProject,
      pipelineRole,
      ...rest
    } = props

    super(scope, id, {
      pipelineName: `${moduleName}_${stageName}_pipeline`,
      artifactBucket: artifactsBucket,
      role: pipelineRole,
      ...rest
    })

    const sourceOutputArtifact = new Artifact()

    const sourceAction = new S3SourceAction({
      bucket: artifactsBucket,
      bucketKey: `${stageName}_module_pipelines/module_source/${moduleName}.zip`,
      output: sourceOutputArtifact,
      trigger: S3Trigger.EVENTS, // Use EVENTS instead of POLL to avoid triggering. We won't set up CloudTrail for S3.
      actionName: `${moduleName}_src`,
      role: pipelineRole
    })

    this.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    })
    const environmentVars = {
      CROSS_ACCOUNT_ID: {
        type: BuildEnvironmentVariableType.PLAINTEXT,
        value: `${config.accountIds[stageName]}`
      },
      TARGET_REGION: {
        type: BuildEnvironmentVariableType.PLAINTEXT,
        value: `${config.defaultRegions[stageName]}`
      },
      SLIC_STAGE: {
        type: BuildEnvironmentVariableType.PLAINTEXT,
        value: stageName
      },
      MODULE_NAME: {
        type: BuildEnvironmentVariableType.PLAINTEXT,
        value: moduleName
      },
      ...projectEnvironmentVars
    }

    const moduleBuildOutputArtifact = new Artifact()
    const moduleBuildAction = new CodeBuildAction({
      actionName: 'Build',
      input: sourceOutputArtifact,
      outputs: [moduleBuildOutputArtifact],
      project: moduleBuildProject,
      role: pipelineRole,
      environmentVariables: environmentVars
    })

    this.addStage({
      stageName: 'Build',
      actions: [moduleBuildAction]
    })

    const moduleDeployOutputArtifact = new Artifact()
    const moduleDeployAction = new CodeBuildAction({
      actionName: 'Deploy',
      input: moduleBuildOutputArtifact,
      outputs: [moduleDeployOutputArtifact],
      project: moduleDeployProject,
      role: pipelineRole,
      environmentVariables: environmentVars
    })

    this.addStage({
      stageName: 'Deploy',
      actions: [moduleDeployAction]
    })
  }
}
