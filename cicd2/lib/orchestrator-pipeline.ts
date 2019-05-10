import { Pipeline, PipelineProps, Artifact } from '@aws-cdk/aws-codepipeline'
import { Construct } from '@aws-cdk/cdk'
import { Bucket } from '@aws-cdk/aws-s3'
import {
  S3SourceAction,
  CodeBuildAction
} from '@aws-cdk/aws-codepipeline-actions'
import StageName from './stage-name'
import { OrchestratorDeployProject } from './orchestrator-deploy-project'
import { SLIC_PIPELINE_SOURCE_ARTIFACT } from './projects/source-project'

export interface OrchestratorPipelineProps extends PipelineProps {
  artifactsBucket: Bucket
}

export class OrchestratorPipeline extends Pipeline {
  constructor(scope: Construct, id: string, props: OrchestratorPipelineProps) {
    const { artifactsBucket, ...rest } = props
    super(scope, id, {
      pipelineName: 'OrchestratorPipeline',
      ...rest
    })

    const sourceOutputArtifact = new Artifact()

    const sourceAction = new S3SourceAction({
      bucket: artifactsBucket,
      bucketKey: SLIC_PIPELINE_SOURCE_ARTIFACT,
      output: sourceOutputArtifact,
      actionName: 'SLICSource'
    })

    this.addStage({
      name: 'Source',
      actions: [sourceAction]
    })

    const orchestratorDeployStagingProject = new OrchestratorDeployProject(
      this,
      'orchestratorDeployStaging',
      {
        stageName: StageName.stg
      }
    )

    const stagingDeployOutputArtifact = new Artifact()
    const stagingDeployAction = new CodeBuildAction({
      actionName: 'Staging',
      input: sourceOutputArtifact,
      output: stagingDeployOutputArtifact,
      project: orchestratorDeployStagingProject
    })

    this.addStage({
      name: 'StagingDeploy',
      actions: [stagingDeployAction]
    })
  }
}
