import iam = require('@aws-cdk/aws-iam')
import { Construct } from '@aws-cdk/core'
import config from '../config'
import StageName from './stage-name'

export default class CodeBuildRole extends iam.Role {
  constructor(scope: Construct, name: string) {
    super(scope, name, {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    })

    ;[StageName.stg, StageName.prod].forEach(stageName => {
      this.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: [
            `arn:aws:iam::${
              config.accountIds[stageName]
            }:role/slic-cicd-deployment-role`
          ]
        })
      )

      this.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['cloudformation:Describe*'],
          resources: [
            `arn:aws:cloudformation:eu-west-1:${
              config.accountIds[stageName]
            }:stack/*/*`
          ]
        })
      )
    })

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${config.region}:${
            config.accountIds.cicd
          }:secret:CICD*`
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
        resources: [`arn:aws:lambda:${config.region}:*:function:*`]
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
        resources: [`arn:aws:logs:${config.region}:*:log-group:*`]
      })
    ) // TODO - specific log groups

    this.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['events:Put*', 'events:Remove*', 'events:Delete*'],
        resources: [`arn:aws:events:${config.region}:*:rule/*`]
      })
    ) // TODO - specific events
  }
}
