import { Construct } from '@aws-cdk/core'
import {
  Artifacts,
  Project,
  ProjectProps,
  FilterGroup,
  EventAction,
  BuildSpec,
  Source
} from '@aws-cdk/aws-codebuild'
import config from '../../config'
import { defaultEnvironment } from '../code-build-environments'
import { IBucket } from '@aws-cdk/aws-s3'

export const SLIC_PIPELINE_SOURCE_ARTIFACT = 'orchestrator-pipeline-source.zip'

export interface SourceProjectProps extends ProjectProps {
  readonly bucket: IBucket
}

export class SourceProject extends Project {
  constructor(scope: Construct, id: string, props: SourceProjectProps) {
    const { bucket, ...rest } = props

    const buildSource = Source.gitHub({
      cloneDepth: 2,
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      webhook: true,
      webhookFilters: [
        FilterGroup.inEventOf(EventAction.PUSH).andBranchIs(config.sourceBranch)
      ]
    })

    const artifacts = Artifacts.s3({
      bucket: props.bucket,
      name: SLIC_PIPELINE_SOURCE_ARTIFACT,
      includeBuildId: false,
      packageZip: true
    })

    super(scope, id, {
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              `bash ./build-scripts/source-kickoff.sh https://github.com/${
              config.sourceRepoOwner
              }/${config.sourceRepoName}.git $CODEBUILD_RESOLVED_SOURCE_VERSION`
            ]
          }
        },
        artifacts: {
          files: '**/*'
        }
      }),
      source: buildSource,
      environment: defaultEnvironment,
      artifacts,
      ...rest
    })
  }
}
