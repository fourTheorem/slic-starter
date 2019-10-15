import { Construct } from '@aws-cdk/core'
import {
  Artifacts,
  Project,
  ProjectProps,
  FilterGroup,
  EventAction,
  BuildSpec,
  Source,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import config from '../../config'
import { defaultEnvironment, defaultRuntimes } from '../code-build-environments'
import { IBucket } from '@aws-cdk/aws-s3'

export const SLIC_PIPELINE_SOURCE_ARTIFACT = 'orchestrator-pipeline-source.zip'
export const DEPLOYMENT_STATE_KEY = 'deployment-state.env'

export interface SourceProjectProps extends ProjectProps {
  readonly bucket: IBucket
}

export class SourceProject extends Project {
  constructor(scope: Construct, id: string, props: SourceProjectProps) {
    const { bucket, ...rest } = props

    const buildSource = Source.gitHub({
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
          install: {
            ...defaultRuntimes,
            commands: ['npm install']
          },
          build: {
            commands: [
              `bash ./build-scripts/source-kickoff.sh https://github.com/${config.sourceRepoOwner}/${config.sourceRepoName}.git $CODEBUILD_RESOLVED_SOURCE_VERSION`
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
      ...rest,
      environmentVariables: {
        ...rest.environmentVariables,
        DEPLOYMENT_STATE_BUCKET: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.bucket.bucketName
        },
        DEPLOYMENT_STATE_KEY: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: DEPLOYMENT_STATE_KEY
        }
      }
    })
  }
}
