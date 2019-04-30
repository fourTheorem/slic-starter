import { Construct } from '@aws-cdk/cdk'
import { Project, ProjectProps, GitHubSource } from '@aws-cdk/aws-codebuild'

import config from '../../config'
import { defaultEnvironment } from '../code-build-environments'

export class SourceProject extends Project {
  constructor(scope: Construct, id: string, props: ProjectProps) {
    const buildSource = new GitHubSource({
      cloneDepth: 1,
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      webhook: true
    })

    super(scope, id, {
      buildSpec: {
        version: '0.2',
        phases: {
          build: {
            commands: [
              `bash ./build-scripts/check-changes.sh https://github.com/${
                config.sourceRepoOwner
              }/${config.sourceRepoName}.git $CODEBUILD_RESOLVED_SOURCE_VERSION`
            ]
          }
        },
        artifacts: {
          files: '**/*'
        }
      },
      source: buildSource,
      environment: defaultEnvironment,
      ...props
    })
  }
}
