import cdk = require('@aws-cdk/core')
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'
import { SourceProject } from './projects/source-project'
import CodeBuildRole from './code-build-role'
import { Bucket } from '@aws-cdk/aws-s3'
import { OrchestratorPipeline } from './orchestrator-pipeline'
import modules from '../modules'
import { ModulePipeline } from './module-pipeline'
import StageName from './stage-name'
// import PipelineDashboard from './pipeline-dashboard'

export class CicdStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const artifactsBucket = new Bucket(this, 'artifactsBucket', {
      bucketName: `slic-build-artifacts-${this.account}-${this.region}`,
      versioned: true
    })

    new OrchestratorPipeline(this, 'orchestrator-pipeline', {
      artifactsBucket
    })

    ;[StageName.stg, StageName.prod].forEach((stageName: StageName) =>
      modules.moduleNames.forEach(moduleName => {
        new ModulePipeline(this, `${moduleName}_${stageName}_pipeline`, {
          artifactsBucket: artifactsBucket,
          moduleName,
          stageName
        })
      })
    )

    const sourceCodeBuildRole = new CodeBuildRole(this, 'sourceCodeBuildRole')

    new SourceProject(this, 'sourceProject', {
      projectName: 'SLICPipelineSource',
      role: sourceCodeBuildRole,
      bucket: artifactsBucket,
      environmentVariables: {
        ARTIFACTS_BUCKET_NAME: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: artifactsBucket.bucketName
        },
        ARTIFACTS_BUCKET_ARN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: artifactsBucket.bucketArn
        }
      }
    })

//    new PipelineDashboard(this, 'pipeline-dashboard')
  }
}
