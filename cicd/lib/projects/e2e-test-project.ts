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
import CodeBuildRole from '../code-build-role'
import * as ssmParams from '../../ssm-params'

export interface E2ETestProjectProps extends PipelineProjectProps {
  stageName: StageName
}

export class E2ETestProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: E2ETestProjectProps) {
    const { stageName, ...rest } = props

    const role = new CodeBuildRole(scope, `${props.stageName}E2ETestRole`)

    const { account, region } = Stack.of(scope)
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
      projectName: `${props.stageName}E2ETest`,
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
          value: ssmParams.Accounts[props.stageName]
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
      buildSpec: BuildSpec.fromSourceFilename('e2e-tests/buildspec.yml'),
      role,
      ...rest
    })
  }
}
