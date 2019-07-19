import iam = require('@aws-cdk/aws-iam')
import { Construct } from '@aws-cdk/core'

export interface ModulePipelineRoleProps {}

export default class ModulePipelineRole extends iam.Role {
  constructor(scope: Construct, name: string, props: ModulePipelineRoleProps = {}) {
    super(scope, name, {
      ...props,
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com')
    })
  }
}
