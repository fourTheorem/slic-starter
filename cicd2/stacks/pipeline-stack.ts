import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core'

import * as iam from '@aws-cdk/aws-iam'
import * as codeBuild from '@aws-cdk/aws-codebuild'
import * as codePipeline from '@aws-cdk/aws-codepipeline'
import * as codePipelineActions from '@aws-cdk/aws-codepipeline-actions'
import * as s3 from '@aws-cdk/aws-s3'

import config from '../config'
import modules from '../modules'

interface PipelineStackProps extends StackProps {
  crossAccountDeployRole: iam.IRole  
}

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props)
    const stage = 'dev' // TODO - change

    const codeBuildEnvironment = {
      computeType: codeBuild.ComputeType.LARGE,
      buildImage: codeBuild.LinuxBuildImage.STANDARD_5_0
    }

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket')
    const pipeline = new codePipeline.Pipeline(this, 'Pipeline', {
      pipelineName: `${config.sourceRepoName}-${stage}`,
      artifactBucket,
      restartExecutionOnUpdate: true // Allow the pipeline to restart if it mutates during CDK deploy
    })

    const sourceOutput = new codePipeline.Artifact('SourceOutput')
    const sourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: 'GitHub',
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      branch: config.sourceBranch,
      output: sourceOutput,
      oauthToken: SecretValue.secretsManager('github-token')
    })

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    })

    const synthArtifact = new codePipeline.Artifact()
    const synthProject = new codeBuild.PipelineProject(this, 'CdkSynthPipeline', {
      projectName: `${config.appName}-${stage}-cdk-synth`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['cd cicd2', 'npm ci']
          },
          build: {
            commands: ['npm run build', 'npm run cdk -- synth']
          },
        },
        artifacts: {
          'files': ['cicd2/**/*', 'app.yml'],
          'name': `synth-${stage}-$(date +%Y%m%d%H%M%S)-$BUILD_ID`,
          'enable-symlinks': true,
        }
      }),
      environment: codeBuildEnvironment
    })

    pipeline.addStage({
      stageName: 'CdkSynth',
      actions: [new codePipelineActions.CodeBuildAction({
        actionName: 'CdkSynth',
        project: synthProject,
        input: sourceOutput,
        outputs: [synthArtifact]
      })]
    })

    const targetAccount = this.node.tryGetContext('target-account') || this.account
    const targetRegion = this.node.tryGetContext('target-region') || this.region
    const deployAccount = this.node.tryGetContext('deploy-account') || this.account
    const deployRegion = this.node.tryGetContext('deploy-region') || this.region

    const cdkContextArgs = [
      `--context target-account=${targetAccount}`,
      `--context target-region=${targetRegion}`,
      `--context deploy-account=${deployAccount}`,
      `--context deploy-region=${deployRegion}`,
    ].join(' ')

    const cdkDeployProject = new codeBuild.PipelineProject(this, 'CdkDeployPipeline', {
      projectName: `${config.appName}-${stage}-cdk-deploy`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'cd cicd2',
              `npm run cdk -- deploy --require-approval=never --verbose ${cdkContextArgs} CrossAccountStack`,
              `npm run cdk -- deploy --require-approval=never --verbose ${cdkContextArgs} PipelineStack`
            ]
          },
        },
      }),
      environment: codeBuildEnvironment,
    })
    cdkDeployProject.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['cloudformation:DescribeStacks'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }))
    // cdk deploy needs to assume the CDK deployment role (https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
    cdkDeployProject.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [`arn:*:iam::${this.account}:role/*`, `arn:*:iam::${targetAccount}:role/*`],
      conditions: {
        'ForAnyValue:StringEquals': {
          'iam:ResourceTag/aws-cdk:bootstrap-role': ['image-publishing', 'file-publishing', 'deploy'],
        },
      },
    }))

    pipeline.addStage({
      stageName: 'SelfMutate',
      actions: [new codePipelineActions.CodeBuildAction({
        actionName: 'CdkDeploy',
        project: cdkDeployProject,
        input: synthArtifact,
      })]
    })

    const unitTestProject = new codeBuild.PipelineProject(this, 'UnitTests', {
      projectName: `${config.appName}-${stage}-unit-tests`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: { commands: ['bash util/install-packages.sh'] },
          build: { commands: ['npm test'] },
        },
        artifacts: { files: '**/*' }
      }),
      environment: codeBuildEnvironment
    })

    const unitTestOutput = new codePipeline.Artifact()
    pipeline.addStage({
      stageName: 'UnitTests',
      actions: [new codePipelineActions.CodeBuildAction({
        actionName: 'UnitTests',
        project: unitTestProject,
        input: sourceOutput,
        outputs: [unitTestOutput]
      })]
    })

    const deployActions: codePipelineActions.CodeBuildAction[] = []
    modules.moduleOrder.forEach((moduleNames, index) => {
      moduleNames.forEach(moduleName => {
        const moduleDeployProject = new codeBuild.PipelineProject(
          this,
          `${moduleName}_${stage}_deploy`, {
          projectName: `${moduleName}-${stage}-deploy`,
          buildSpec: codeBuild.BuildSpec.fromObject({
            version: '0.2',
            phases: {
              install: { commands: ['bash build-scripts/build-module.sh'] },
              build: { commands: ['bash build-scripts/deploy-module.sh'] },
            },
            artifacts: { files: '**/*' }
          }),
          environment: codeBuildEnvironment,
          environmentVariables: {
            MODULE_NAME: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: moduleName
            },
            SLIC_STAGE: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: stage
            },
            TARGET_REGION: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: this.region // TODO use target region in context
            },
            ROLE_ARN: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: props.crossAccountDeployRole.roleArn
            }
          },
        })
        moduleDeployProject.role?.addToPrincipalPolicy(new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: [props.crossAccountDeployRole.roleArn]
        }))

        const moduleDeployAction = new codePipelineActions.CodeBuildAction({
          actionName: `${moduleName}_${stage}_deploy`,
          project: moduleDeployProject,
          input: sourceOutput,
          runOrder: index + 1
        })
        deployActions.push(moduleDeployAction)
      })
    })
    pipeline.addStage({
      stageName: 'DeployModules',
      actions: deployActions
    })
  }
}