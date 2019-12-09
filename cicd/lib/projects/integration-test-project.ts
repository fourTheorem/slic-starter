import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType,
  BuildSpec,
  LinuxBuildImage
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/core'
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

    const role = new CodeBuildRole(
      scope,
      `${props.stageName}IntegrationTestRole`
    )
    // Allow access to secret environment variables in Parameter Store required for tests
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameters'],
        resources: [
          `arn:aws:ssm:${config.region}:${
            config.accountIds.cicd
          }:parameter/test/*`
        ]
      })
    )
    super(scope, id, {
      projectName: `${props.stageName}IntegrationTest`,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_2_0
      },
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.stageName
        },
        CROSS_ACCOUNT_ID: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: `${config.accountIds[props.stageName]}`
        },
        MAILOSAUR_API_KEY: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: '/test/mailosaur/apiKey'
        },
        MAILOSAUR_SERVER_ID: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: '/test/mailosaur/serverId'
        }
      },
      buildSpec: BuildSpec.fromSourceFilename(
        'integration-tests/buildspec.yml'
      ),
      role,
      ...rest
    })
  }
}
