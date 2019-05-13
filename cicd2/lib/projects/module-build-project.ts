import {
  PipelineProject,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/cdk'
import config from '../../config'
import CodeBuildRole from '../code-build-role'
import { defaultEnvironment } from '../code-build-environments'
import moduleArtifacts from './module-artifacts'

export interface ModuleBuildProjectProps {
  moduleName: string
  stageName: StageName
  codeBuildRole: CodeBuildRole
}

export class ModuleBuildProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleBuildProjectProps) {
    const { codeBuildRole, moduleName, stageName } = props
    super(scope, id, {
      projectName: id,
      role: codeBuildRole,
      environment: defaultEnvironment,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PlainText,
          value: props.stageName
        },
        CROSS_ACCOUNT_ID: {
          type: BuildEnvironmentVariableType.PlainText,
          value: `${config.accountIds[stageName]}`
        },
        MODULE_NAME: {
          type: BuildEnvironmentVariableType.PlainText,
          value: moduleName
        }
      },
      buildSpec: {
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
      }
    })
  }
}
