import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType,
  BuildSpec,
  LinuxBuildImage
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct, Stack } from '@aws-cdk/core'
import iam = require('@aws-cdk/aws-iam')
import * as ssmParams from '../../ssm-params'

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
    const { region, account } = Stack.of(scope)

    // Allow access to secret environment variables in Parameter Store required for tests
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameters'],
        resources: [
          `arn:aws:ssm:${region}:${account}:parameter/test/*`
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
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: ssmParams.Accounts[stageName]
        },
        MAILOSAUR_API_KEY: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: ssmParams.Test.MAILOSAUR_API_KEY
        },
        MAILOSAUR_SERVER_ID: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: ssmParams.Test.MAILOSAUR_SERVER_ID
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
