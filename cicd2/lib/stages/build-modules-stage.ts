import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { defaultEnvironment } from '../code-build-environments'
import StageName from '../stage-name'
import config from '../../config'
import CodeBuildRole from '../code-build-role'
import { State } from '@aws-cdk/aws-stepfunctions'

export interface BuildModulesStateProps {
  stageNo: number
  stageModules: string[]
  stageName: StageName
  codeBuildRole: CodeBuildRole
}

export default class BuildModulesStage extends Construct {
  readonly buildModuleProjects: { [name: string]: codeBuild.Project } = {}
  readonly stageState: State

  constructor(scope: Construct, props: BuildModulesStateProps) {
    super(scope, `${props.stageName}BuildStage${props.stageNo}`)

    const { stageName, stageModules } = props

    stageModules.forEach(moduleName => {
      this.buildModuleProjects[moduleName] = new codeBuild.Project(
        this,
        `${stageName}_${moduleName}_build_project`,
        {
          buildSpec: {
            version: '0.2',
            env: {
              variables: {
                MODULE_NAME: moduleName
              }
            },
            phases: {
              install: {
                commands: ['bash ./build-scripts/install-phase.sh']
              },
              pre_build: {
                commands: ['bash ./build-scripts/pre_build-phase.sh']
              },
              build: {
                commands: [
                  `SLIC_STAGE=${stageName} CROSS_ACCOUNT_ID=${
                    config.accountIds[stageName]
                  } bash ./build-scripts/build-phase.sh`
                ]
              }
            },
            artifacts: {
              files: [
                '*.yml',
                '*.js',
                'build-scripts/**/*',
                `${moduleName}/*.yml`,
                `${moduleName}/*.js`,
                `${moduleName}/node_modules/**/*`,
                `${moduleName}/package.json`,
                `${moduleName}/package-lock.json`,
                `${moduleName}/build-artifacts/**/*`,
                `${moduleName}/build/**/*`,
                'module-config.env'
              ]
            }
          },
          environment: defaultEnvironment,
          role: props.codeBuildRole
        }
      )
    })

    /*
    const buildModuleActions: {
      [moduleName: string]: CodeBuildAction
    } = {}

    pipeline.addStage({
      name: `build_${stageName}_${stageNo}`,
      actions: stageModules.map(moduleName => {
        buildModuleActions[
          moduleName
        ] = new codePipelineActions.CodeBuildAction({
          actionName: `build_${stageName}_${moduleName}`,
          input: resources.checkChangesAction.output,
          project: buildModuleProjects[moduleName]
        })
        return buildModuleActions[moduleName]
      })
    })
    resources.buildModuleActions = {
      ...(resources.buildModuleActions || {}),
      ...buildModuleActions
    }
    */
  }
}
