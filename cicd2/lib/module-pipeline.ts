import { Pipeline, Artifact } from '@aws-cdk/aws-codepipeline'
import { Construct } from '@aws-cdk/cdk'
import { Bucket } from '@aws-cdk/aws-s3'
import {
  S3SourceAction,
  CodeBuildAction
} from '@aws-cdk/aws-codepipeline-actions'
import StageName from './stage-name'
import CodeBuildRole from './code-build-role'
import { ModuleDeployProject } from './projects/module-deploy-project'
import { ModuleBuildProject } from './projects/module-build-project'

export interface ModulePipelineProps {
  artifactsBucket: Bucket
  codeBuildRole: CodeBuildRole
  stageName: StageName
  moduleName: string
}

export class ModulePipeline extends Pipeline {
  constructor(scope: Construct, id: string, props: ModulePipelineProps) {
    const {
      artifactsBucket,
      codeBuildRole,
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
      pollForSourceChanges: false,
      actionName: `${moduleName}_${stageName}_src`
    })

    this.addStage({
      name: 'Source',
      actions: [sourceAction]
    })

    // Build
    const moduleBuildProject = new ModuleBuildProject(
      this,
      `${moduleName}_${stageName}_build`,
      {
        codeBuildRole,
        moduleName,
        stageName
      }
    )

    const moduleBuildOutputArtifact = new Artifact()
    const moduleBuildAction = new CodeBuildAction({
      actionName: 'Build',
      input: sourceOutputArtifact,
      output: moduleBuildOutputArtifact,
      project: moduleBuildProject
    })

    this.addStage({
      name: 'Build',
      actions: [moduleBuildAction]
    })

    // Deploy
    const moduleDeployProject = new ModuleDeployProject(
      this,
      `${moduleName}_${stageName}_deploy`,
      {
        codeBuildRole,
        moduleName,
        stageName
      }
    )

    const moduleDeployOutputArtifact = new Artifact()
    const moduleDeployAction = new CodeBuildAction({
      actionName: 'Deploy',
      input: moduleBuildOutputArtifact,
      output: moduleDeployOutputArtifact,
      project: moduleDeployProject
    })

    this.addStage({
      name: 'Deploy',
      actions: [moduleDeployAction]
    })
  }
}
