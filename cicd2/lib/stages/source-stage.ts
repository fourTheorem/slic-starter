import { Construct, SecretValue } from '@aws-cdk/cdk'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')

import config from '../../config'

export default class SourceStage extends Construct {
  constructor(scope: Construct, resources: any) {
    super(scope, 'sourceStage')
    const pipeline: Pipeline = resources.pipeline

    const tokenSecret = SecretValue.secretsManager('CICD', {
      jsonField: 'GitHubPersonalAccessToken'
    })

    const sourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: 'SourceAction',
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      branch: config.sourceBranch,
      oauthToken: tokenSecret,
      outputArtifactName: 'slic-source'
    })
    resources.sourceAction = sourceAction
    pipeline.addStage({ name: 'source', actions: [sourceAction] })
  }
}
