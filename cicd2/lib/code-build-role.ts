import iam = require('@aws-cdk/aws-iam')
import { RoleProps } from '@aws-cdk/aws-iam'
import { Construct } from '@aws-cdk/cdk'
import config from '../config'

export default class CodeBuildRole extends iam.Role {
  constructor(scope: Construct, resources: any, id: string, props?: RoleProps) {
    super(scope, id, {
      ...props,
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    })

    // Allow CodeBuild to assume the deployment role in the target account
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addActions('sts:AssumeRole')
        .addResource(
          `arn:aws:iam::${config.accountIds.dev}:role/slic-cicd-deployment-role`
        )
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('secretsmanager:GetSecretValue')
        .addResource(
          `arn:aws:secretsmanager:${config.region}:${
            config.accountIds.cicd
          }:secret:CICD*`
        )
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('s3:DeleteObject')
        .addAction('s3:GetObject')
        .addAction('s3:GetObjectVersion')
        .addAction('s3:ListBucket')
        .addAction('s3:PutObject')
        .addAction('s3:GetBucketPolicy')
        .addAction('s3:GetEncryptionConfiguration')
        .addAction('s3:PutEncryptionConfiguration')
        .addResources(`arn:aws:s3:::codepipeline-${config.region}-*`)
        .addResources(resources.buildBucket.bucketArn)
        .addResources(resources.buildBucket.arnForObjects('*'))
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('cloudformation:Describe*')
        .addResource(
          `arn:aws:cloudformation:eu-west-1:${config.accountIds.dev}:stack/*/*`
        )
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('lambda:Get*')
        .addAction('lambda:List*')
        .addAction('lambda:CreateFunction')
        .addAllResources()
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('lambda:AddPermission')
        .addAction('lambda:CreateAlias')
        .addAction('lambda:DeleteFunction')
        .addAction('lambda:InvokeFunction')
        .addAction('lambda:PublishVersion')
        .addAction('lambda:RemovePermission')
        .addAction('lambda:Update*')
        .addResource(`arn:aws:lambda:${config.region}:*:function:*`)
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('apigateway:GET')
        .addAction('apigateway:POST')
        .addAction('apigateway:PUT')
        .addAction('apigateway:DELET')
        .addResource('arn:aws:apigateway:*::/restapis*')
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('iam:PassRole')
        .addAction('iam:GetRole')
        .addAction('iam:CreateRole')
        .addAction('iam:PutRolePolicy')
        .addAction('iam:DeleteRolePolicy')
        .addAction('iam:DeleteRole')
        .addResource('arn:aws:iam::*:role/*')
    ) // TODO - Change to specific Lambda roles?
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('sqs:*')
        .addResource('arn:aws:sqs:*:*:*')
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('logs:CreateLogGroup')
        .addAction('logs:CreateLogStream')
        .addAction('logs:DeleteLogGroup')
        .addAction('logs:PutLogEvents')
        .addResource(`arn:aws:logs:${config.region}:*:log-group:*`)
    ) // TODO - specific log groups
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('events:Put*')
        .addAction('events:Remove*')
        .addAction('events:Delete*')
        .addResource(`arn:aws:events:${config.region}:*:rule/*`)
    ) // TODO - specific events
  }
}
