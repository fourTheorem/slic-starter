import {
  PipelineProject,
  PipelineProjectProps,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/cdk'

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
    super(scope, id, {
      projectName: `${props.stageName}IntegrationTest`,
      environmentVariables: {
        SLIC_STAGE: {
          type: BuildEnvironmentVariableType.PlainText,
          value: props.stageName
        }
      },
      buildSpec: 'integration-tests/buildspec.yml',
      ...rest
    })
  }
}
