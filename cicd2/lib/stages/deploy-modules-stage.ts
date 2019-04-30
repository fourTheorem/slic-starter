import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { PipelineProject } from '@aws-cdk/aws-codebuild'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import { defaultEnvironment } from '../code-build-environments'
import { CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import modules from '../../modules'
import StageName from '../stage-name'
import config from '../../config'
const { deployOrder } = modules

export default class DeployModulesStage extends Construct {
  constructor(
    scope: Construct,
    stageNo: number,
    stageModules: Array<string>,
    resources: any,
    stageName: StageName
  ) {
    super(scope, `${stageName}DeployMod${stageNo}`)
    const deployModuleProjects: { [name: string]: PipelineProject } = {}

    const pipeline: Pipeline = resources.pipeline
    stageModules.forEach(moduleName => {
      deployModuleProjects[moduleName] = new codeBuild.PipelineProject(
        this,
        `${stageName}_deploy_${moduleName}`,
        {
          buildSpec: {
            version: '0.2',
            env: {
              variables: {
                MODULE_NAME: moduleName,
                SLIC_STAGE: stageName,
                CROSS_ACCOUNT_ID: config.accountIds[stageName]
              }
            },
            phases: {
              build: {
                commands: [`bash ./build-scripts/deploy-module.sh`]
              }
            }
          },
          environment: defaultEnvironment,
          role: resources.codeBuildRole
        }
      )
    })

    resources.deployModuleProjects = deployModuleProjects
    const deployActions: { [moduleName: string]: CodeBuildAction } = {}
    pipeline.addStage({
      name: `${stageName}_deploy_${stageNo}`,
      actions: stageModules.map(moduleName => {
        deployActions[moduleName] = new codePipelineActions.CodeBuildAction({
          actionName: `${stageName}_deploy_${moduleName}`,
          input: resources.buildModuleActions[moduleName].output,
          project: deployModuleProjects[moduleName],
          runOrder: deployOrder[moduleName]
        })
        return deployActions[moduleName]
      })
    })
    resources.deployActions = deployActions
  }
}
