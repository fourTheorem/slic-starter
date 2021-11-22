import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as s3 from '@aws-cdk/aws-s3'
import * as pipelines from '@aws-cdk/pipelines';
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as iam from '@aws-cdk/aws-iam'

import config from '../config';

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cacheBucket = new s3.Bucket(this, 'CodeBuildCache')
    const cacheAccessStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      effect: iam.Effect.ALLOW,
      resources: [`${cacheBucket.bucketArn}/codeBuildCache/*`]
    })

    const synthStep = new pipelines.CodeBuildStep('Synth', {
      rolePolicyStatements: [cacheAccessStatement],
      // This relies on the presence of a Secrets Manager secret named 'github-token'
      input: pipelines.CodePipelineSource.gitHub(
        `${config.sourceRepoOwner}/${config.sourceRepoName}`, config.sourceBranch, {
        authentication: SecretValue.secretsManager('github-token')
      }),
      commands: ['cd cicd2', 'npm ci', 'npm run build', 'npm run cdk -- synth'],
      primaryOutputDirectory: 'cicd2/cdk.out',
      partialBuildSpec: codebuild.BuildSpec.fromObject({
        cache: {
          paths: ['cicd2/cdk.out/**/*', 'cicd2/node_modules/**/*']
        },
      })
    })
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: synthStep
    })

    const unitTestStep = new pipelines.CodeBuildStep('UnitTest', {
      rolePolicyStatements: [cacheAccessStatement],
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

    pipeline.buildPipeline() // Build so we can access the CfnProject to inject cache property

    const synthProject = unitTestStep.project.node.defaultChild as codebuild.CfnProject
    const utProject = unitTestStep.project.node.defaultChild as codebuild.CfnProject
    synthProject.cache = {
      type: 'S3',
      location: `${cacheBucket.bucketName}/codeBuildCache/synth`
    }
    utProject.cache = {
      type: 'S3',
      location: `${cacheBucket.bucketName}/codeBuildCache/unitTest`
    }
  }

}
