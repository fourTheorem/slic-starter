import { Construct } from '@aws-cdk/cdk'
import { PipelineProject } from '@aws-cdk/aws-codebuild'

import config from '../../config'
import { defaultEnvironment } from '../code-build-environments'
import { CodeBuildBuildAction } from '@aws-cdk/aws-codepipeline-actions'

export class CheckChangesStage extends Construct {
  constructor(scope: Construct, resources: any) {
    super(scope, 'checkChanges')

    resources.checkChangesProject = new PipelineProject(
      scope,
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
          },
          artifacts: {
            files: '**/*'
          }
        },
        environment: defaultEnvironment,
        role: resources.codeBuildRole
      }
    )

    const checkChangesAction = new CodeBuildBuildAction({
      actionName: 'check-changes',
      inputArtifact: resources.sourceAction.outputArtifact,
      outputArtifactName: 'slic-source-checked',
      project: resources.checkChangesProject
    })

    resources.checkChangesAction = checkChangesAction
    resources.pipeline.addStage({
      name: 'check_changes',
      actions: [checkChangesAction]
    })
  }
}
