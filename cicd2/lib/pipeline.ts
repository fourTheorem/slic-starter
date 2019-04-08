import { Construct, SecretValue } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import codePipeline = require('@aws-cdk/aws-codepipeline')
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import { defaultEnvironment } from './code-build-environments'
import config from '../config'

export default class SlicPipeline extends codePipeline.Pipeline {
  constructor(scope: Construct, resources: any) {
    super(scope, 'pipeline', {
      pipelineName: 'SLICPipeline'
    })

    const tokenSecret = SecretValue.secretsManager('CICD', {
      jsonField: 'GitHubPersonalAccessToken'
    })

    const sourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: 'SourceAction',
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      branch: 'feature/advanced-cicd-#19', // TODO - change this to master
      oauthToken: tokenSecret,
      outputArtifactName: 'slic-source'
    })

    // It is recommended to use a Secrets Manager SecretString to obtain the token:
    this.addStage({
      name: 'Source',
      actions: [sourceAction]
    })

    const checkChangesProject = new codeBuild.PipelineProject(
      this,
      'CheckChangesProject',
      {
        buildSpec: {
          version: '0.2',
          phases: {
            build: {
              commands: [
                `bash ./build-scripts/check-changes.sh https://github.com/${
                  config.sourceRepoOwner
                }/${
                  config.sourceRepoName
                }.git $CODEBUILD_RESOLVED_SOURCE_VERSION`
              ]
            }
          }
        },
        environment: defaultEnvironment,
        role: resources.codeBuildRole
      }
    )

    this.addStage({
      name: 'CheckChanges',
      actions: [
        new codePipelineActions.CodeBuildBuildAction({
          actionName: 'check-changes',
          inputArtifact: sourceAction.outputArtifact,
          outputArtifactName: 'slic-source-checked',
          project: checkChangesProject
        })
      ]
    })
  }
}
