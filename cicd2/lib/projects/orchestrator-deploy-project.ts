import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/cdk'
import config from '../../config'
import modules from '../../modules'

export interface OrchestratorDeployProjectProps extends PipelineProjectProps {
  stageName: StageName
}

export class OrchestratorDeployProject extends PipelineProject {
  constructor(
    scope: Construct,
    id: string,
    props: OrchestratorDeployProjectProps
  ) {
    super(scope, id, {
      projectName: `${props.stageName}DeployProject`,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PlainText,
          value: props.stageName
        },
        CROSS_ACCOUNT_ID: {
          type: BuildEnvironmentVariableType.PlainText,
          value: `${config.accountIds[props.stageName]}`
        },
        MODULE_NAMES: {
          type: BuildEnvironmentVariableType.PlainText,
          value: modules.moduleNames.join(' ')
        }
      },
      buildSpec: {
        version: '0.2',
        phases: {
          build: {
            commands: ['bash ./build-scripts/orchestrator-stage-deploy.sh']
          }
        }
      }
    })
  }
}
