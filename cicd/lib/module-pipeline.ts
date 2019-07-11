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

export interface ModulePipelineProps {
  artifactsBucket: Bucket
  stageName: StageName
  moduleName: string
}

export class ModulePipeline extends Pipeline {
  constructor(scope: Construct, id: string, props: ModulePipelineProps) {
    const {
      artifactsBucket,
      moduleName,
      stageName,
      ...rest
    } = props

    super(scope, id, {
      pipelineName: `${moduleName}_${stageName}_pipeline`,
      artifactBucket: artifactsBucket,
      ...rest
    })

    const sourceOutputArtifact = new Artifact()

    const sourceAction = new S3SourceAction({
      bucket: artifactsBucket,
      bucketKey: `${stageName}_module_pipelines/module_source/${moduleName}.zip`,
      output: sourceOutputArtifact,
      trigger: S3Trigger.POLL,
      actionName: `${moduleName}_${stageName}_src`
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
        stageName
      }
    )

    const moduleBuildOutputArtifact = new Artifact()
    const moduleBuildAction = new CodeBuildAction({
      actionName: 'Build',
      input: sourceOutputArtifact,
      outputs: [moduleBuildOutputArtifact],
      project: moduleBuildProject
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
        stageName
      }
    )

    const moduleDeployOutputArtifact = new Artifact()
    const moduleDeployAction = new CodeBuildAction({
      actionName: 'Deploy',
      input: moduleBuildOutputArtifact,
      outputs: [moduleDeployOutputArtifact],
      project: moduleDeployProject
    })

    this.addStage({
      stageName: 'Deploy',
      actions: [moduleDeployAction]
    })
  }
}
