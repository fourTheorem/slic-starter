import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { PipelineProject } from '@aws-cdk/aws-codebuild'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import { defaultEnvironment } from '../code-build-environments'
import { CodeBuildBuildAction } from '@aws-cdk/aws-codepipeline-actions'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import modules from '../../modules'
const { moduleNames } = modules

export default class DeployModulesStage extends Construct {
  constructor(scope: Construct, resources: any) {
    super(scope, 'deployMod')
    const deployModuleProjects: { [name: string]: PipelineProject } = {}

    const pipeline: Pipeline = resources.pipeline
    moduleNames.forEach(moduleName => {
      deployModuleProjects[moduleName] = new codeBuild.PipelineProject(
        this,
        `${moduleName}DeployStg`,
        {
          buildSpec: {
            version: '0.2',
            env: {
              variables: {
                MODULE_NAME: moduleName
              }
            },
            phases: {
              build: {
                commands: ['bash ./build-scripts/deploy-module.sh']
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
      name: 'DeployStg',
      actions: moduleNames.map(moduleName => {
        deployActions[
          moduleName
        ] = new codePipelineActions.CodeBuildBuildAction({
          actionName: `deploy_${moduleName}`,
          inputArtifact:
            resources.buildModuleActions[moduleName].outputArtifact,
          project: deployModuleProjects[moduleName]
        })
        return deployActions[moduleName]
      })
    })
    resources.deployActions = deployActions
  }
}
