import {
  PipelineProject,
  BuildEnvironmentVariableType,
  BuildSpec
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/core'
import config from '../../config'
import { defaultEnvironment } from '../code-build-environments'
import moduleArtifacts from './module-artifacts'
import { Role } from '@aws-cdk/aws-iam'

export interface ModuleBuildProjectProps {
  moduleName: string
  stageName: StageName
  role: Role
}

export class ModuleBuildProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleBuildProjectProps) {
    const { moduleName, stageName, ...rest } = props
    super(scope, id, {
      projectName: id,
      environment: defaultEnvironment,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.stageName
        },
        SLIC_NS_DOMAIN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: config.nsDomain
        },
        CROSS_ACCOUNT_ID: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: `${config.accountIds[stageName]}`
        },
        MODULE_NAME: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: moduleName
        },
        TARGET_REGION: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: `${config.defaultRegions[stageName]}`
        },
        FRONTEND_BUCKET_NAME: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: `${config.frontendBucketName}`
        }
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: ['bash ./build-scripts/build-module.sh']
          },
          post_build: {
            commands: ['bash ./build-scripts/package-module.sh']
          }
        },
        artifacts: moduleArtifacts(moduleName)
      }),
      ...rest
    })
  }
}
