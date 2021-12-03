import { Construct, PhysicalName, Stack, StackProps } from '@aws-cdk/core'

import * as iam from '@aws-cdk/aws-iam'

export class CrossAccountStack extends Stack {

  readonly crossAccountDeployRole: iam.IRole

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    const stage = 'dev' // TODO - change

    this.crossAccountDeployRole = new iam.Role(this, `${stage}CrossAccountDeployRole`, {
      roleName: `${stage}CrossAccountDeployRole`,
      assumedBy: new iam.AccountPrincipal(this.node.tryGetContext('deploy-account') || this.account),
    })
    const services = [
      'cloudformation',
      'apigateway',
      'lambda',
      'cloudfront',
      's3',
      'logs',
      'events',
      'acm',
      'route53',
      'cognito-idp',
      'cognito-identity',
      'ssm',
    ]
    for (const service of services) {
      this.crossAccountDeployRole.addToPrincipalPolicy(new iam.PolicyStatement({
        actions: [`${service}:*`],
        resources: ['*']
      }))
    }
  }

}
