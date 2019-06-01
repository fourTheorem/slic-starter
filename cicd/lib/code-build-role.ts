import iam = require('@aws-cdk/aws-iam')
import { Construct } from '@aws-cdk/cdk'
import config from '../config'
import { StateMachine } from '@aws-cdk/aws-stepfunctions'

export interface CodeBuildRoleProps {
  readonly pipelineStateMachine?: StateMachine
}

export default class CodeBuildRole extends iam.Role {
  constructor(scope: Construct, name: string, props: CodeBuildRoleProps = {}) {
    const { pipelineStateMachine, ...rest } = props
    super(scope, name, {
      ...rest,
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    })

    // Allow CodeBuild to assume the deployment role in the target account
    const assumeRolePolicy = new iam.PolicyStatement()
      .allow()
      .addActions('sts:AssumeRole')
    Object.values(config.accountIds).forEach(accountId =>
      assumeRolePolicy.addResource(
        `arn:aws:iam::${accountId}:role/slic-cicd-deployment-role`
      )
    )
    this.addToPolicy(assumeRolePolicy)

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

    if (pipelineStateMachine) {
      this.addToPolicy(
        new iam.PolicyStatement()
          .allow()
          .addAction('states:DescribeExecution')
          .addAction('states:StartExecution')
          .addResource(pipelineStateMachine.stateMachineArn)
      )
    }

    const cfPolicy = new iam.PolicyStatement()
      .allow()
      .addAction('cloudformation:Describe*')
    Object.values(config.accountIds).forEach(accountId =>
      cfPolicy.addResource(
        `arn:aws:cloudformation:eu-west-1:${accountId}:stack/*/*`
      )
    )
    this.addToPolicy(cfPolicy)

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
        .addAction('route53:CreateHostedZone')
        .addAction('route53:ChangeResourceRecordSets')
        .addAllResources()
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('acm:RequestCertificate')
        .addAllResources()
    )
    this.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('apigateway:GET')
        .addAction('apigateway:POST')
        .addAction('apigateway:PUT')
        .addAction('apigateway:DELETE')
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
