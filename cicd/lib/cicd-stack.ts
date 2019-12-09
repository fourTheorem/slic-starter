import cdk = require('@aws-cdk/core')
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'
import { SourceProject } from './projects/source-project'
import CodeBuildRole from './code-build-role'
import { Bucket } from '@aws-cdk/aws-s3'
import { OrchestratorPipeline } from './orchestrator-pipeline'
import modules from '../modules'
import { ModulePipeline } from './module-pipeline'
import StageName from './stage-name'
import ModulePipelineRole from './module-pipeline-role'
import PipelineDashboard from './pipeline-dashboard'
import { ModuleBuildProject } from './projects/module-build-project'
import { ModuleDeployProject } from './projects/module-deploy-project'

export class CicdStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const artifactsBucket = new Bucket(this, 'artifactsBucket', {
      bucketName: `slic-build-artifacts-${this.account}-${this.region}`,
      versioned: true
    })

    const sourceCodeBuildRole = new CodeBuildRole(this, 'sourceCodeBuildRole')

    new OrchestratorPipeline(this, 'orchestrator-pipeline', {
      artifactsBucket,
      sourceCodeBuildRole
    })

    const buildRole = new CodeBuildRole(this, `buildRole`)
    const deployRole = new CodeBuildRole(this, `deployRole`)

    const moduleBuildProject = new ModuleBuildProject(this, 'module_build', {
      role: buildRole
    })

    // Deploy
    const moduleDeployProject = new ModuleDeployProject(this, `module_deploy`, {
      role: deployRole
    })
    ;[StageName.stg, StageName.prod].forEach((stageName: StageName) => {
      const pipelineRole = new ModulePipelineRole(
        this,
        `${stageName}PipelineRole`
      )

      modules.moduleNames.forEach(moduleName => {
        new ModulePipeline(this, `${moduleName}_${stageName}_pipeline`, {
          artifactsBucket: artifactsBucket,
          moduleBuildProject,
          moduleDeployProject,
          moduleName,
          stageName,
          pipelineRole
        })
      })
    })

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

    new PipelineDashboard(this, 'pipeline-dashboard')
  }
}
