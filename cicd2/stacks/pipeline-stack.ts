import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as pipelines from '@aws-cdk/pipelines';
import * as codebuild from '@aws-cdk/aws-codebuild'

import config from '../config';
import modules from '../modules';
import * as ssmParams from '../ssm-params'

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = 'dev' // TODO - change

    const synthStep = new pipelines.CodeBuildStep('Synth', {
      // This relies on the presence of a Secrets Manager secret named 'github-token'
      input: pipelines.CodePipelineSource.gitHub(
        `${config.sourceRepoOwner}/${config.sourceRepoName}`, config.sourceBranch, {
        authentication: SecretValue.secretsManager('github-token')
      }),
      commands: ['cd cicd2', 'npm ci', 'npm run build', 'npm run cdk -- synth'],
      primaryOutputDirectory: 'cicd2/cdk.out'
    })

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: synthStep,
      codeBuildDefaults: {
        buildEnvironment: {
          computeType: codebuild.ComputeType.LARGE
        } 
      }
    })

    const unitTestStep = new pipelines.CodeBuildStep('UnitTest', {
      installCommands: [
        'bash util/install-packages.sh'
      ],
      commands: ['npm test'],

    })

    pipeline.addWave('UnitTests', {
      pre: [unitTestStep],
    })

    const deploySteps = modules.moduleNames.map(moduleName => new pipelines.CodeBuildStep(
      `${moduleName}_deploy`, {
      buildEnvironment: {
        computeType: codebuild.ComputeType.LARGE,
        environmentVariables: {
          MODULE_NAME: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: moduleName
          },
          SLIC_STAGE: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: stage
          },
          TARGET_REGION: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: this.region
          },
          CROSS_ACCOUNT_ID: {
            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
            value: ssmParams.Accounts[stage]
          }
        }
      },
      installCommands: ['bash build-scripts/build-module.sh'],
      commands: ['bash build-scripts/deploy-module.sh']
    }))

    pipeline.addWave('Deploy', {
      pre: deploySteps
    })

  }

}
