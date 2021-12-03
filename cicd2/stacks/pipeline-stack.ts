import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as codeBuild from '@aws-cdk/aws-codebuild'
import * as codePipeline from '@aws-cdk/aws-codepipeline'
import * as codePipelineActions from '@aws-cdk/aws-codepipeline-actions'
import * as s3 from '@aws-cdk/aws-s3'

import config from '../config';
import modules from '../modules';
import * as ssmParams from '../ssm-params'

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
          'base-directory': 'cicd2',
          'files': ['**/*'],
          'name': `synth-${stage}-$(date +%Y%m%d%H%M%S)-$BUILD_ID`
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

    const cdkDeployProject = new codeBuild.PipelineProject(this, 'CdkDeployPipeline', {
      projectName: `${config.appName}-${stage}-cdk-deploy`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: { commands: ['npm run cdk -- deploy --all --require-approval=never --verbose'] },
        },
      }),
      environment: codeBuildEnvironment,
    })

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
        artifacts: { files: '**/*'} 
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

    const deployActions = modules.moduleNames.map(moduleName => {
      const moduleDeployProject = new codeBuild.PipelineProject(
        this,
        `${moduleName}_${stage}_deploy`, {
        projectName: `${moduleName}-${stage}-deploy`,
        buildSpec: codeBuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            build: { commands: ['bash scripts/deploy-module.sh'] },
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
            value: this.region
          },
          CROSS_ACCOUNT_ID: {
            type: codeBuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: ssmParams.Accounts[stage]
          }
        },
      })
      const moduleDeployAction = new codePipelineActions.CodeBuildAction({
        actionName: `${moduleName}_${stage}_deploy`,
        project: moduleDeployProject,
        input: unitTestOutput,
      })
      return moduleDeployAction
    })
    pipeline.addStage({
      stageName: 'DeployModules',
      actions: deployActions
    })
  }
}