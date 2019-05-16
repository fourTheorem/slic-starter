import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/cdk'
import config from '../../config'

export interface E2ETestProjectProps extends PipelineProjectProps {
  stageName: StageName
}

export class E2ETestProject extends PipelineProject {
  constructor(
    scope: Construct,
    id: string,
    props: E2ETestProjectProps
  ) {
    const { stageName, ...rest } = props

    super(scope, id, {
      projectName: `${props.stageName}E2ETest`,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PlainText,
          value: props.stageName
        },
        CROSS_ACCOUNT_ID: {
          type: BuildEnvironmentVariableType.PlainText,
          value: `${config.accountIds[props.stageName]}`
        },
        MAILOSAUR_API_KEY: {
          type: BuildEnvironmentVariableType.ParameterStore,
          value: 'MailosaurApiKey'
        },
        MAILOSAUR_SERVER_ID: {
          type: BuildEnvironmentVariableType.ParameterStore,
          value: 'MailosaurServerId'
        }
      },
      buildSpec: 'e2e-tests/buildspec.yml',
      ...rest
    })
  }
}
