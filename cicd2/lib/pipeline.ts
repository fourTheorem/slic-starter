import { Construct } from '@aws-cdk/cdk'
import codePipeline = require('@aws-cdk/aws-codepipeline')
import { CheckChangesStage } from './stages/check-changes-stage'
import SourceStage from './stages/source-stage'
import BuildModulesStage from './stages/build-modules-stage'
import DeployModulesStage from './stages/deploy-modules-stage'
import StageName from './stage-name'
import ManualApprovalStage from './stages/manual-approval-stage'

export default class SlicPipeline extends codePipeline.Pipeline {
  constructor(scope: Construct, resources: any) {
    super(scope, 'pipeline', {
      pipelineName: 'SLICPipeline'
    })
    resources.pipeline = this
    resources.sourceStage = new SourceStage(this, resources)
    resources.checkChangesStage = new CheckChangesStage(this, resources)
    resources.buildModulesStage = new BuildModulesStage(this, resources)
    resources.stgDeployModulesStage = new DeployModulesStage(
      this,
      resources,
      StageName.stg
    )
    resources.manualApprovalStage = new ManualApprovalStage(
      this,
      'ProductionApproval',
      resources
    )
    resources.prodDeployModulesStage = new DeployModulesStage(
      this,
      resources,
      StageName.prod
    )
  }
}
