import cdk = require('@aws-cdk/cdk')

import CodeBuildRole from './code-build-role'
import SlicPipeline from './pipeline'

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const resources: any = {}
    resources.codeBuildRole = new CodeBuildRole(this)
    resources.pipeline = new SlicPipeline(this, resources)
  }
}
