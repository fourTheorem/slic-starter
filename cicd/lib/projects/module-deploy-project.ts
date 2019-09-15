import { PipelineProject, BuildSpec } from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/core'
import { defaultEnvironment } from '../code-build-environments'
import { projectEnvironmentVars } from './project-environment'
import moduleArtifacts from './module-artifacts'
import { Role } from '@aws-cdk/aws-iam'

export interface ModuleDeployProjectProps {
  moduleName: string
  stageName: StageName
  role: Role
}

export class ModuleDeployProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleDeployProjectProps) {
    const { moduleName, stageName } = props
    super(scope, id, {
      projectName: id,
      role: props.role,
      environment: defaultEnvironment,
      environmentVariables: projectEnvironmentVars({ stageName, moduleName }),
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: ['bash ./build-scripts/deploy-module.sh']
          }
        },
        artifacts: moduleArtifacts(moduleName)
      })
    })
  }
}
