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

export interface ModuleDeployProjectProps {
  moduleName: string
  stageName: StageName
  role: Role
}

export class ModuleDeployProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleDeployProjectProps) {
    const { moduleName, stageName } = props
    super(scope, id, {
      projectName: id,
      role: props.role,
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
        SITE_BUCKET_PREFIX: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: `${config.siteBucketPrefix}`
        }
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: ['bash ./build-scripts/deploy-module.sh']
          }
        },
        artifacts: moduleArtifacts(moduleName)
      })
    })
  }
}
