import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { PipelineProject } from '@aws-cdk/aws-codebuild'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import { defaultEnvironment } from '../code-build-environments'
import { CodeBuildBuildAction } from '@aws-cdk/aws-codepipeline-actions'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import config from '../../config'
import modules from '../../modules'
const { moduleNames } = modules

export default class BuildModulesStage extends Construct {
  constructor(scope: Construct, resources: any) {
    super(scope, 'buildModulesStage')
    const buildModuleProjects: { [name: string]: PipelineProject } = {}

    const pipeline: Pipeline = resources.pipeline
    moduleNames.forEach(moduleName => {
      buildModuleProjects[moduleName] = new codeBuild.PipelineProject(
        this,
        `${moduleName}BuildModuleProject`,
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
                  `SLIC_STAGE=stg CROSS_ACCOUNT_ID=${
                    config.accountIds.stg
                  } bash ./build-scripts/build-phase.sh`,
                  `SLIC_STAGE=prod CROSS_ACCOUNT_ID=${
                    config.accountIds.prod
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
      [moduleName: string]: CodeBuildBuildAction
    } = {}
    pipeline.addStage({
      name: 'BuildModules',
      actions: moduleNames.map(moduleName => {
        buildModuleActions[
          moduleName
        ] = new codePipelineActions.CodeBuildBuildAction({
          actionName: `build_${moduleName}`,
          inputArtifact: resources.checkChangesAction.outputArtifact,
          project: buildModuleProjects[moduleName]
        })
        return buildModuleActions[moduleName]
      })
    })
    resources.buildModuleActions = buildModuleActions
  }
}
