import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { PipelineProject } from '@aws-cdk/aws-codebuild'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import { defaultEnvironment } from '../code-build-environments'
import { CodeBuildBuildAction } from '@aws-cdk/aws-codepipeline-actions'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import modules from '../../modules'
import StageName from '../stage-name'
import config from '../../config'
const { moduleNames, deployOrder } = modules

export default class DeployModulesStage extends Construct {
  constructor(scope: Construct, resources: any, stageName: StageName) {
    super(scope, `${stageName}DeployMod`)
    const deployModuleProjects: { [name: string]: PipelineProject } = {}

    const pipeline: Pipeline = resources.pipeline
    moduleNames.forEach(moduleName => {
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
    const deployActions: { [moduleName: string]: CodeBuildBuildAction } = {}
    pipeline.addStage({
      name: `${stageName}_deploy`,
      actions: moduleNames.map(moduleName => {
        deployActions[
          moduleName
        ] = new codePipelineActions.CodeBuildBuildAction({
          actionName: `${stageName}_deploy_${moduleName}`,
          inputArtifact:
            resources.buildModuleActions[moduleName].outputArtifact,
          project: deployModuleProjects[moduleName],
          runOrder: deployOrder[moduleName]
        })
        return deployActions[moduleName]
      })
    })
    resources.deployActions = deployActions
  }
}
