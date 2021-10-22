import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType,
  BuildSpec
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/core'
import modules from '../../modules'
import * as ssmParams from '../../ssm-params'

export interface OrchestratorDeployProjectProps extends PipelineProjectProps {
  stageName: StageName
}

export class OrchestratorDeployProject extends PipelineProject {
  constructor(
    scope: Construct,
    id: string,
    props: OrchestratorDeployProjectProps
  ) {
    const { stageName, ...rest } = props
    super(scope, id, {
      projectName: `${props.stageName}DeployProject`,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.stageName
        },
        CROSS_ACCOUNT_ID: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: ssmParams.Accounts[stageName]
        },
        MODULE_NAMES: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: modules.moduleNames.join(' ')
        }
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: ['bash ./build-scripts/orchestrator-stage-deploy.sh']
          }
        }
      }),
      ...rest
    })
  }
}
