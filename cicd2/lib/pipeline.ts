import { Construct } from '@aws-cdk/cdk'
import codePipeline = require('@aws-cdk/aws-codepipeline')
import { CheckChangesStage } from './stages/check-changes-stage'
import SourceStage from './stages/source-stage'
import BuildModulesStage from './stages/build-modules-stage'
import DeployModulesStage from './stages/deploy-modules-stage'
import StageName from './stage-name'
import ManualApprovalStage from './stages/manual-approval-stage'

import modules from '../modules'
const { stages } = modules

export default class SlicPipeline extends codePipeline.Pipeline {
  constructor(scope: Construct, resources: any) {
    super(scope, 'pipeline', {
      pipelineName: 'SLICPipeline'
    })
    resources.pipeline = this
    resources.sourceStage = new SourceStage(this, resources)
    resources.checkChangesStage = new CheckChangesStage(this, resources)
    stages.forEach((stageModules, index) => {
      const stageNo = index + 1
      resources[`buildModulesStage${stageNo}`] = new BuildModulesStage(
        this,
        stageNo,
        stageModules,
        resources
      )
      resources.stgDeployModulesStage = new DeployModulesStage(
        this,
        stageNo,
        stageModules,
        resources,
        StageName.stg
      )
    })
    resources.manualApprovalStage = new ManualApprovalStage(
      this,
      'ProductionApproval',
      resources
    )
    stages.forEach((stageModules, index) => {
      const stageNo = index + 1
      resources[`prodDeployModulesStage${stageNo}`] = new DeployModulesStage(
        this,
        stageNo,
        stageModules,
        resources,
        StageName.prod
      )
    })
  }
}
