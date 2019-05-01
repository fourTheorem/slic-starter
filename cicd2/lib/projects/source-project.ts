import { Construct } from '@aws-cdk/cdk'
import {
  Project,
  GitHubSource,
  S3BucketBuildArtifacts,
  ProjectProps
} from '@aws-cdk/aws-codebuild'
import config from '../../config'
import { defaultEnvironment } from '../code-build-environments'
import { IBucket } from '@aws-cdk/aws-s3'

export interface SourceProjectProps extends ProjectProps {
  readonly bucket: IBucket
}

export class SourceProject extends Project {
  constructor(scope: Construct, id: string, props: SourceProjectProps) {
    const { bucket, ...rest } = props

    const buildSource = new GitHubSource({
      cloneDepth: 2,
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      webhook: true
    })

    const artifacts = new S3BucketBuildArtifacts({
      bucket: props.bucket,
      name: 'SLICPipelineArtifacts',
      includeBuildId: true,
      packageZip: true
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
      artifacts,
      ...rest
    })
  }
}
