import {
  PipelineProject,
  BuildSpec,
  PipelineProjectProps,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import { Construct } from '@aws-cdk/core'
import { defaultEnvironment } from '../code-build-environments'
import { DEPLOYMENT_STATE_KEY } from './source-project'

interface UpdateDeploymentStateProjectProps extends PipelineProjectProps {
  bucketName: string
}

export class UpdateDeploymentStateProject extends PipelineProject {
  constructor(
    scope: Construct,
    id: string,
    props: UpdateDeploymentStateProjectProps
  ) {
    super(scope, id, {
      projectName: id,
      role: props.role,
      environment: defaultEnvironment,
      environmentVariables: {
        DEPLOYMENT_STATE_BUCKET: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.bucketName
        },
        DEPLOYMENT_STATE_KEY: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: DEPLOYMENT_STATE_KEY
        }
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 12
            }
          },
          build: {
            commands: ['bash ./build-scripts/update-deployment-state.sh']
          }
        }
      })
    })
  }
}
