import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { PipelineProject } from '@aws-cdk/aws-codebuild'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import { defaultEnvironment } from '../code-build-environments'
import { CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import StageName from '../stage-name'
import config from '../../config'

export default class BuildModulesStage extends Construct {
  constructor(
    scope: Construct,
    stageNo: number,
    stageModules: Array<string>,
    resources: any,
    stageName: StageName
  ) {
    super(scope, `${stageName}BuildStage${stageNo}`)
    const buildModuleProjects: { [name: string]: PipelineProject } = {}

    const pipeline: Pipeline = resources.pipeline
    stageModules.forEach(moduleName => {
      buildModuleProjects[moduleName] = new codeBuild.PipelineProject(
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
          role: resources.codeBuildRole
        }
      )
    })

    resources.buildModuleProjects = buildModuleProjects
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
  }
}
