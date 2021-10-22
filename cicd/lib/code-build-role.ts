import iam = require('@aws-cdk/aws-iam')
import ssm = require('@aws-cdk/aws-ssm')
import { Construct, Stack } from '@aws-cdk/core'
import StageName from './stage-name'
import * as ssmParams from '../ssm-params'

export default class CodeBuildRole extends iam.Role {
  constructor(scope: Construct, name: string) {
    super(scope, name, {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    })

    const { account, region } = Stack.of(scope)

    ;[StageName.stg, StageName.prod].forEach(stageName => {
      const stageAccount = ssm.StringParameter.fromStringParameterAttributes(this, `${stageName}Account`, {
        parameterName: ssmParams.Accounts[stageName]
      }).stringValue;

      this.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: [
            `arn:aws:iam::${stageAccount}:role/slic-cicd-deployment-role`
          ]
        })
      )

      this.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['cloudformation:Describe*'],
          resources: [
            `arn:aws:cloudformation:eu-west-1:${stageAccount}:stack/*/*`
          ]
        })
      )
    })

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${region}:${account}:secret:CICD*`
        ]
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['lambda:Get*', 'lambda:List*', 'lambda:CreateFunction'],
        resources: ['*']
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'lambda:AddPermission',
          'lambda:CreateAlias',
          'lambda:DeleteFunction',
          'lambda:InvokeFunction',
          'lambda:PublishVersion',
          'lambda:RemovePermission',
          'lambda:Update*'
        ],
        resources: [`arn:aws:lambda:${region}:*:function:*`]
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'route53:CreateHostedZone',
          'route53:ChangeResourceRecordSets'
        ],
        resources: ['*']
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['acm:RequestCertificate'],
        resources: ['*']
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'apigateway:GET',
          'apigateway:POST',
          'apigateway:PUT',
          'apigateway:DELETE'
        ],
        resources: ['arn:aws:apigateway:*::/restapis*']
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:PassRole',
          'iam:GetRole',
          'iam:CreateRole',
          'iam:PutRolePolicy',
          'iam:DeleteRolePolicy',
          'iam:DeleteRole'
        ],
        resources: ['arn:aws:iam::*:role/*']
      })
    ) // TODO - Change to specific Lambda roles?

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sqs:*'],
        resources: ['arn:aws:sqs:*:*:*']
      })
    )

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:DeleteLogGroup',
          'logs:PutLogEvents'
        ],
        resources: [`arn:aws:logs:${region}:*:log-group:*`]
      })
    ) // TODO - specific log groups

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['events:Put*', 'events:Remove*', 'events:Delete*'],
        resources: [`arn:aws:events:${region}:*:rule/*`]
      })
    ) // TODO - specific events
  }
}
