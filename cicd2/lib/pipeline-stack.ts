import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as pipelines from '@aws-cdk/pipelines';
import * as codebuild from '@aws-cdk/aws-codebuild'

import config from '../config';
import { CodeBuildStep } from '@aws-cdk/pipelines';

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
    const unitTestStep = new pipelines.CodeBuildStep('UnitTest', {
      installCommands: [
        'bash util/install-packages.sh'
      ],
      commands: [
        'npm test'
      ],
      partialBuildSpec: codebuild.BuildSpec.fromObject({
        cache: {
          paths: ['/root/.npm/**/*', 'node_modules/**/*']
        },
      })
    })

    pipeline.addWave('UnitTests', {
      pre: [unitTestStep]
    })

    pipeline.buildPipeline()

    const artifactBucketName = pipeline.pipeline.artifactBucket.bucketName

    const cbProject = unitTestStep.project.node.defaultChild as codebuild.CfnProject
    cbProject.cache = {
      type: 'S3',
      location: `${artifactBucketName}/codeBuildCache`
    }
  }

}
