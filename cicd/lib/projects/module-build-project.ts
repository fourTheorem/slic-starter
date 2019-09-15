import { PipelineProject, BuildSpec } from '@aws-cdk/aws-codebuild'
import StageName from '../stage-name'
import { Construct } from '@aws-cdk/core'
import { defaultEnvironment } from '../code-build-environments'
import { projectEnvironmentVars } from './project-environment'
import moduleArtifacts from './module-artifacts'
import { Role } from '@aws-cdk/aws-iam'

export interface ModuleBuildProjectProps {
  moduleName: string
  stageName: StageName
  role: Role
}

export class ModuleBuildProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleBuildProjectProps) {
    const { moduleName, stageName, ...rest } = props
    super(scope, id, {
      projectName: id,
      environment: defaultEnvironment,
      environmentVariables: projectEnvironmentVars({ moduleName, stageName }),
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: ['bash ./build-scripts/build-module.sh']
          },
          post_build: {
            commands: ['bash ./build-scripts/package-module.sh']
          }
        },
        artifacts: moduleArtifacts(moduleName)
      }),
      ...rest
    })
  }
}
