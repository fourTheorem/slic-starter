import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as pipelines from '@aws-cdk/pipelines';
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as codepipeline from '@aws-cdk/aws-codepipeline'
import * as cpa from '@aws-cdk/aws-codepipeline-actions'

import config from '../config';
import { CodeBuildStep } from '@aws-cdk/pipelines';
import { CpuInfo } from 'os';

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
      commands: ['npm test']
    })

    pipeline.addWave('UnitTests', {
      pre: [unitTestStep]
    })

    const deployStep = new pipelines.CodeBuildStep('Deploy', {
      partialBuildSpec: codebuild.BuildSpec.fromObject({
        batch: {
          'fast-fail': false,
          'build-graph':  [
            {
              identifier: 'certs',
              'ignore-failure': false,
              env: {
                'compute-type': 'BUILD_GENERAL1_LARGE',
                variables: {
                  MODULE_NAME: 'api-service',
                  SLIC_STAGE: 'dev',
                  TARGET_REGION: this.region
                }
              }
            },
            {
              identifier: 'checklist-service',
              'ignore-failure': false,
              env: {
                'compute-type': 'BUILD_GENERAL1_LARGE',
                variables: {
                  MODULE_NAME: 'checklist-service',
                  SLIC_STAGE: 'dev',
                  TARGET_REGION: this.region
                }
              },
              'depend-on': ['certs']
            }
          ]
        },
      }),
      commands: ['bash scripts/build.sh']
    })

    pipeline.addWave('Deploy', {
      pre: [deployStep]
    })

    pipeline.buildPipeline()

    const deployProject = pipeline.pipeline.node.defaultChild as codebuild.PipelineProject
    deployProject.enableBatchBuilds
  }

}
