import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

import * as pipelines from '@aws-cdk/pipelines';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as cp from '@aws-cdk/aws-codepipeline';
import * as cpa from '@aws-cdk/aws-codepipeline-actions';

import config from '../config';
import { CodePipelineFileSet } from '@aws-cdk/pipelines';

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const unitTestProject = new codebuild.Project(this, 'UnitTestProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'npm ci '
            ]
          },
          build: {
            commands: [
              'npm test'
            ]
          }
        }
      })
    })

    const sourceArtifact = new cp.Artifact()
    const sourceAction = new cpa.GitHubSourceAction({
      actionName: 'Source',
      repo: config.sourceRepoName,
      owner: config.sourceRepoOwner,
      branch: config.sourceBranch,
      trigger: cpa.GitHubTrigger.WEBHOOK,
      oauthToken: SecretValue.secretsManager('github-token'),
      output: sourceArtifact
    })


    const unitTestAction = new cpa.CodeBuildAction({
      actionName: 'UnitTest',
      project: unitTestProject,
      input: sourceArtifact
    })

    const codePipeline = new cp.Pipeline(this, 'CorePipeline', {})
    codePipeline.addStage({ stageName: 'Source', actions: [sourceAction] })
    codePipeline.addStage({ stageName: 'UnitTest', actions: [unitTestAction] })

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        // This relies on the presence of a Secrets Manager secret named 'github-token'
        input: CodePipelineFileSet.fromArtifact(sourceArtifact),
        commands: ['cd cicd2', 'npm ci', 'npm run build', 'npm run cdk -- synth'],
        primaryOutputDirectory: 'cicd2/cdk.out',
      }),
      codePipeline
    })
  }

}
