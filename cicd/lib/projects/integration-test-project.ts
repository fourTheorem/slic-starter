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

export interface IntegrationTestProjectProps extends PipelineProjectProps {
  stageName: StageName
}

export class IntegrationTestProject extends PipelineProject {
  constructor(
    scope: Construct,
    id: string,
    props: IntegrationTestProjectProps
  ) {
    const { stageName, ...rest } = props

    const role = new CodeBuildRole(scope, `${props.stageName}IntegrationTestRole`)
    // Allow access to secret environment variables in Parameter Store required for tests
    role.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('ssm:GetParameters')
        .addResource(`arn:aws:ssm:${config.region}:${config.accountIds.cicd}:parameter/test/*`)
)
    super(scope, id, {
      projectName: `${props.stageName}IntegrationTest`,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PlainText,
          value: props.stageName
        },
        SLIC_NS_DOMAIN: {
          type: BuildEnvironmentVariableType.PlainText,
          value: config.nsDomain
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
      buildSpec: 'integration-tests/buildspec.yml',
      role,
      ...rest
    })
  }
}
