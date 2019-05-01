import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { defaultEnvironment } from '../code-build-environments'
import StageName from '../stage-name'
import config from '../../config'
import CodeBuildRole from '../code-build-role'
import {
  Parallel,
  Task,
  Choice,
  Condition,
  Succeed
} from '@aws-cdk/aws-stepfunctions'
import { Function } from '@aws-cdk/aws-lambda'

export interface BuildModulesStateProps {
  stageNo: number
  stageModules: string[]
  stageName: StageName
  codeBuildRole: CodeBuildRole
  runCodeBuildFunction: Function
}

export default class BuildModulesStage extends Construct {
  readonly buildModuleProjects: { [name: string]: codeBuild.Project } = {}
  readonly stageState: Parallel

  constructor(scope: Construct, props: BuildModulesStateProps) {
    super(scope, `${props.stageName}BuildStage${props.stageNo}`)

    const { stageName, stageModules, stageNo } = props

    this.stageState = new Parallel(this, `${stageName}Build${stageNo}`)

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

      const ifChangedChoice = new Choice(this, `${moduleName} changed?`)
      ifChangedChoice
        .when(
          Condition.or(
            Condition.booleanEquals(`$.changes.${moduleName}`, true),
            Condition.booleanEquals('$.changes.all_modules', true)
          ),
          new Task(this, `${moduleName}_${stageName}_build`, {
            resource: props.runCodeBuildFunction,
            parameters: {
              codeBuildProjectArn: this.buildModuleProjects[moduleName]
                .projectArn
            }
          })
        )
        .otherwise(new Succeed(this, `Skip ${moduleName}`))

      this.stageState.branch(ifChangedChoice)
    })
  }
}
