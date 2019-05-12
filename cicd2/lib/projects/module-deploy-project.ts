import {
  PipelineProject,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/cdk'
import config from '../../config'
import CodeBuildRole from '../code-build-role'

export interface ModuleDeployProjectProps {
  moduleName: string
  stageName: StageName
  codeBuildRole: CodeBuildRole
}

export class ModuleDeployProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleDeployProjectProps) {
    const { codeBuildRole, moduleName, stageName } = props
    super(scope, id, {
      projectName: id,
      role: codeBuildRole,
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
            commands: ['bash ./build-scripts/deploy-module.sh']
          }
        }
      }
    })
  }
}
