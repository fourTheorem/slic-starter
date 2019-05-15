import { Construct } from '@aws-cdk/cdk'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import { ManualApprovalAction } from '@aws-cdk/aws-codepipeline-actions'

export default class ManualApprovalStage extends Construct {
  constructor(scope: Construct, name: string, resources?: any) {
    super(scope, `${name}Stage`)

    const pipeline: Pipeline = resources.pipeline
    pipeline.addStage({
      name,
      actions: [
        new ManualApprovalAction({
          actionName: `${name}_action`
        })
      ]
    })
  }
}
