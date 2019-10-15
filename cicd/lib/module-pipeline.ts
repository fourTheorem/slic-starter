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

export interface ModulePipelineProps {
  artifactsBucket: Bucket
  stageName: StageName
  moduleName: string
  buildRole: Role
  deployRole: Role
  pipelineRole: Role
}

export class ModulePipeline extends Pipeline {
  constructor(scope: Construct, id: string, props: ModulePipelineProps) {
    const {
      artifactsBucket,
      moduleName,
      stageName,
      buildRole,
      deployRole,
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
      actionName: `${moduleName}_${stageName}_src`,
      role: pipelineRole
    })

    this.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    })

    // Build
    const moduleBuildProject = new ModuleBuildProject(
      this,
      `${moduleName}_${stageName}_build`,
      {
        moduleName,
        stageName,
        role: buildRole
      }
    )

    const moduleBuildOutputArtifact = new Artifact()
    const moduleBuildAction = new CodeBuildAction({
      actionName: 'Build',
      input: sourceOutputArtifact,
      outputs: [moduleBuildOutputArtifact],
      project: moduleBuildProject,
      role: pipelineRole
    })

    this.addStage({
      stageName: 'Build',
      actions: [moduleBuildAction]
    })

    // Deploy
    const moduleDeployProject = new ModuleDeployProject(
      this,
      `${moduleName}_${stageName}_deploy`,
      {
        moduleName,
        stageName,
        role: deployRole
      }
    )

    const moduleDeployOutputArtifact = new Artifact()
    const moduleDeployAction = new CodeBuildAction({
      actionName: 'Deploy',
      input: moduleBuildOutputArtifact,
      outputs: [moduleDeployOutputArtifact],
      project: moduleDeployProject,
      role: pipelineRole
    })

    this.addStage({
      stageName: 'Deploy',
      actions: [moduleDeployAction]
    })
  }
}
