import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/cdk'
import iam = require('@aws-cdk/aws-iam')
import config from '../../config'
import CodeBuildRole from '../code-build-role'

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

    const role = new CodeBuildRole(scope, `${props.stageName}E2ETestRole`)
    role.addToPolicy(
      new iam.PolicyStatement()
      .allow()
      .addAction('ssm:GetParameters')
      .addResource(`arn:aws:ssm:${config.region}:${config.accountIds.cicd}:parameter/Mailosaur*`)
    )

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
          value: '/test/mailosaur/apiKey'
        },
        MAILOSAUR_SERVER_ID: {
          type: BuildEnvironmentVariableType.ParameterStore,
          value: '/test/mailosaur/serverId'
        }
      },
      buildSpec: 'e2e-tests/buildspec.yml',
      role,
      ...rest
    })
  }
}
