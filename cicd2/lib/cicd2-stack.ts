import cdk = require('@aws-cdk/cdk')
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'
import { SourceProject } from './projects/source-project'
import CodeBuildRole from './code-build-role'
import { Bucket } from '@aws-cdk/aws-s3'
import { OrchestratorPipeline } from './orchestrator-pipeline'

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const artifactsBucket = new Bucket(this, 'artifactsBucket', {
      bucketName: `slic-build-artifacts-${this.env.account}-${this.env.region}`,
      versioned: true
    })

    // const codeBuildRole = new CodeBuildRole(this, 'stageBuildRole')

    new OrchestratorPipeline(this, 'orchestrator-pipeline', {
      artifactsBucket
    })

    const sourceCodeBuildRole = new CodeBuildRole(this, 'sourceCodeBuildRole')

    new SourceProject(this, 'sourceProject', {
      projectName: 'SLICPipelineSource',
      role: sourceCodeBuildRole,
      bucket: artifactsBucket,
      environmentVariables: {
        ARTIFACTS_BUCKET_NAME: {
          type: BuildEnvironmentVariableType.PlainText,
          value: artifactsBucket.bucketName
        },
        ARTIFACTS_BUCKET_ARN: {
          type: BuildEnvironmentVariableType.PlainText,
          value: artifactsBucket.bucketArn
        }
      }
    })
  }
}
