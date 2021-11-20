import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as pipelines from '@aws-cdk/pipelines';

import config from '../config';

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        // This relies on the presence of a Secrets Manager secret named 'github-token'
        input: pipelines.CodePipelineSource.gitHub(
          `${config.sourceRepoOwner}/${config.sourceRepoName}`, config.sourceBranch, {
            authentication: SecretValue.secretsManager('github-token')
          }
        ),
        commands: ['cd cicd2', 'npm ci', 'npm run build', 'npm run cdk -- synth'],
        primaryOutputDirectory: 'cicd2/cdk.out',
      })
    })
    pipeline.addWave('Unit Tests', {
      pre: [
        new pipelines.CodeBuildStep('UnitTest', {
          installCommands: [
            'bash util/install-packages.sh'
          ],
          commands: [
            'npm test'
          ]
        })
      ]

    })
  }

}
