import { Role, ServicePrincipal, PolicyStatement } from '@aws-cdk/aws-iam'
import { Pipeline, PipelineProps, Artifact } from '@aws-cdk/aws-codepipeline'
import { Construct } from '@aws-cdk/core'
import { Bucket } from '@aws-cdk/aws-s3'
import {
  S3SourceAction,
  CodeBuildAction,
  ManualApprovalAction,
  S3Trigger
} from '@aws-cdk/aws-codepipeline-actions'
import StageName from './stage-name'
import { OrchestratorDeployProject } from './projects/orchestrator-deploy-project'
import { IntegrationTestProject } from './projects/integration-test-project'
import { E2ETestProject } from './projects/e2e-test-project'

import { SLIC_PIPELINE_SOURCE_ARTIFACT } from './projects/source-project'
import { UpdateDeploymentStateProject } from './projects/update-deployment-state-project'

export interface OrchestratorPipelineProps extends PipelineProps {
  artifactsBucket: Bucket
  sourceCodeBuildRole: Role
}

export class OrchestratorPipeline extends Pipeline {
  constructor(scope: Construct, id: string, props: OrchestratorPipelineProps) {
    const { artifactsBucket, sourceCodeBuildRole, ...rest } = props
    super(scope, id, {
      pipelineName: 'OrchestratorPipeline',
      artifactBucket: artifactsBucket,
      ...rest
    })

    // This role is for managing module pipelines
    const orchestratorCodeBuildRole = new Role(
      this,
      'orchestrator-codebuild-role',
      {
        roleName: 'orchestrator-codebuild-role',
        assumedBy: new ServicePrincipal('codebuild.amazonaws.com')
      }
    )
    orchestratorCodeBuildRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'codepipeline:GetPipelineExecution',
          'codepipeline:StartPipelineExecution'
        ],
        resources: ['*']
      })
    )

    const sourceOutputArtifact = new Artifact()

    const sourceAction = new S3SourceAction({
      bucket: artifactsBucket,
      bucketKey: SLIC_PIPELINE_SOURCE_ARTIFACT,
      output: sourceOutputArtifact,
      trigger: S3Trigger.POLL,
      actionName: 'SLICSource'
    })

    this.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    })

    this.addDeployStage(
      StageName.stg,
      orchestratorCodeBuildRole,
      sourceOutputArtifact
    )

    this.addTestStage(sourceOutputArtifact)

    this.addStage({
      stageName: 'Approval',
      actions: [
        new ManualApprovalAction({
          actionName: 'MoveToProduction'
        })
      ]
    })

    this.addDeployStage(
      StageName.prod,
      orchestratorCodeBuildRole,
      sourceOutputArtifact
    )

    this.addStage({
      stageName: 'UpdateDeploymentState',
      actions: [
        new CodeBuildAction({
          actionName: 'UpdateState',
          input: sourceOutputArtifact,
          project: new UpdateDeploymentStateProject(
            this,
            'updateDeploymentStateProject',
            {
              bucketName: this.artifactBucket.bucketName,
              role: sourceCodeBuildRole
            }
          )
        })
      ]
    })
  }

  addTestStage(sourceOutputArtifact: Artifact) {
    const integrationTestProject = new IntegrationTestProject(
      this,
      `IntegrationTests`,
      {
        stageName: StageName.stg
      }
    )

    const integrationTestOutputArtifact = new Artifact()
    const integrationTestAction = new CodeBuildAction({
      actionName: 'integration_tests',
      input: sourceOutputArtifact,
      outputs: [integrationTestOutputArtifact],
      project: integrationTestProject
    })

    const e2eTestProject = new E2ETestProject(this, `e2eTests`, {
      stageName: StageName.stg
    })

    const e2eTestOutputArtifact = new Artifact()
    const e2eTestAction = new CodeBuildAction({
      actionName: 'e2e_tests',
      input: sourceOutputArtifact,
      outputs: [e2eTestOutputArtifact],
      project: e2eTestProject
    })

    this.addStage({
      stageName: 'Test',
      actions: [integrationTestAction, e2eTestAction]
    })
  }

  addDeployStage(
    stageName: StageName,
    orchestratorCodeBuildRole: Role,
    sourceOutputArtifact: Artifact
  ) {
    const orchestratorDeployStagingProject = new OrchestratorDeployProject(
      this,
      `${stageName}OrchestratorDeploy`,
      {
        stageName,
        role: orchestratorCodeBuildRole
      }
    )

    const deployOutputArtifact = new Artifact()
    const deployAction = new CodeBuildAction({
      actionName: stageName,
      input: sourceOutputArtifact,
      outputs: [deployOutputArtifact],
      project: orchestratorDeployStagingProject
    })

    this.addStage({
      stageName: `${stageName}Deploy`,
      actions: [deployAction]
    })
  }
}
