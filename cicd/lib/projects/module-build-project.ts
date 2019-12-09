import { PipelineProject, BuildSpec } from '@aws-cdk/aws-codebuild'
import { Construct } from '@aws-cdk/core'
import { defaultEnvironment, defaultRuntimes } from '../code-build-environments'
import { projectEnvironmentVars } from './project-environment'
import moduleArtifacts from './module-artifacts'
import { Role } from '@aws-cdk/aws-iam'

export interface ModuleBuildProjectProps {
  role: Role
}

export class ModuleBuildProject extends PipelineProject {
  constructor(scope: Construct, id: string, props: ModuleBuildProjectProps) {
    super(scope, id, {
      projectName: id,
      environment: defaultEnvironment,
      environmentVariables: projectEnvironmentVars,
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            ...defaultRuntimes
          },
          pre_build: {
            commands: ['bash ./build-scripts/audit-module.sh']
          },
          build: {
            commands: ['bash ./build-scripts/build-module.sh']
          },
          post_build: {
            commands: ['bash ./build-scripts/package-module.sh']
          }
        },
        artifacts: moduleArtifacts
      }),
      ...props
    })
  }
}
