import cdk = require('@aws-cdk/cdk')
import iam = require('@aws-cdk/aws-iam')
import s3 = require('@aws-cdk/aws-s3')
import codePipeline = require('@aws-cdk/aws-codepipeline')
import codeBuild = require('@aws-cdk/aws-codebuild')
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import { SecretValue } from '@aws-cdk/cdk'

import { defaultEnvironment } from './code-build-environments'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import config from '../config'

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucketResources = this.defineBucket()
    this.definePipeline(bucketResources)
  }

  defineBucket() {
    const buildBucket = new s3.Bucket(this, 'buildBucket', {
      bucketName: config.buildBucket
    })
    buildBucket.addToResourcePolicy(
      new iam.PolicyStatement()
        .addActions('s3:DeleteObject')
        .addActions('s3:GetObject')
        .addActions('s3:GetObjectVersioon')
        .addActions('s3:PutObject')
        .addResources(buildBucket.arnForObjects('*'))
        .addAwsPrincipal(`${config.accountIds.dev}`)
    )
    buildBucket.addToResourcePolicy(
      new iam.PolicyStatement()
        .addActions('s3:ListBucket')
        .addActions('s3:GetBucket*')
        .addResources(buildBucket.bucketArn)
        .addAwsPrincipal(`${config.accountIds.dev}`)
    )

    return {
      buildBucket
    }
  }

  definePipeline(resources: any) {
    this.defineCodeBuildRole(resources)

    const pipeline = new codePipeline.Pipeline(this, 'pipeline')
    this.defineCodePipelineRole(resources, pipeline)

    const tokenSecret = SecretValue.secretsManager('CICD', {
      jsonField: 'GitHubPersonalAccessToken'
    })

    const sourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: 'SourceAction',
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      branch: 'feature/advanced-cicd-#19', // TODO - change this to master
      oauthToken: tokenSecret,
      outputArtifactName: 'slic-source'
    })

    // It is recommended to use a Secrets Manager SecretString to obtain the token:
    pipeline.addStage({
      name: 'Source',
      actions: [sourceAction]
    })

    const checkChangesProject = new codeBuild.PipelineProject(
      this,
      'CheckChanges',
      {
        buildSpec: {
          version: '0.2',
          phases: {
            build: {
              commands: [
                `bash ./build-scripts/check-changes.sh https://github.com/${
                  config.sourceRepoOwner
                }/${
                  config.sourceRepoName
                }.git $CODEBUILD_RESOLVED_SOURCE_VERSION`
              ]
            }
          }
        },
        environment: defaultEnvironment
      }
    )

    pipeline.addStage({
      name: 'CheckChanges',
      actions: [
        new codePipelineActions.CodeBuildBuildAction({
          actionName: 'check-changes',
          inputArtifact: sourceAction.outputArtifact,
          outputArtifactName: 'slic-source-checked',
          project: checkChangesProject
        })
      ]
    })
  }

  defineCodeBuildRole(resources: any) {
    const codeBuildRole = new iam.Role(this, 'codeBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    })
    // Allow CodeBuild to assume the deployment role in the target account
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addActions('sts:AssumeRole')
        .addResource(
          `arn:aws:iam::${config.accountIds.dev}:role/slic-cicd-deployment-role`
        )
    )
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('secretsmanager:GetSecretValue')
        .addResource(
          'arn:aws.secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:CICD*'
        )
    )
    codeBuildRole.addToPolicy(
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
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('cloudformation:Describe*')
        .addResource(
          'arn:aws:cloudformation:${AWS::Region}:{AWS::AccountId}:stack/*/*'
        )
    )
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('lambda:Get*')
        .addAction('lambda:List*')
        .addAction('lambda:CreateFunction')
        .addAllResources()
    )
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('lambda:AddPermission')
        .addAction('lambda:CreateAlias')
        .addAction('lambda:DeleteFunction')
        .addAction('lambda:InvokeFunction')
        .addAction('lambda:PublishVersion')
        .addAction('lambda:RemovePermission')
        .addAction('lambda:Update*')
        .addResource(`arn:aws:labmda:${config.region}:*:function:*`)
    )
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('apigateway:GET')
        .addAction('apigateway:POST')
        .addAction('apigateway:PUT')
        .addAction('apigateway:DELET')
        .addResource('arn:aws:apigateway:*::/restapis*')
    )
    codeBuildRole.addToPolicy(
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
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('sqs:*')
        .addResource('arn:aws:sqs:*:*:*')
    )
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('logs:CreateLogGroup')
        .addAction('logs:CreateLogStream')
        .addAction('logs:DeleteLogGroup')
        .addAction('logs:PutLogEvents')
        .addAllResources()
    ) // TODO - specific log groups
    codeBuildRole.addToPolicy(
      new iam.PolicyStatement()
        .allow()
        .addAction('events:Put*')
        .addAction('events:Remove*')
        .addAction('events:Delete*')
        .addAllResources()
    ) // TODO - specific events
  }

  defineCodePipelineRole(resources: any, pipeline: Pipeline) {
    pipeline.addToRolePolicy(
      new iam.PolicyStatement()
        .allow()
        .addActions('s3:DeleteObject')
        .addActions('s3:GetObject')
        .addActions('s3:GetObjectVersioon')
        .addActions('s3:PutObject')
        .addResources(resources.buildBucket.arnForObjects('*'))
    )

    pipeline.addToRolePolicy(
      new iam.PolicyStatement()
        .addActions('s3:ListBucket')
        .addActions('s3:GetBucket*')
        .addResources(resources.buildBucket.bucketArn)
    )

    pipeline.addToRolePolicy(
      new iam.PolicyStatement()
        .addActions('s3:CreateBucke')
        .addActions('s3:GetEncryptionConfiguration')
        .addActions('s3:SetEncryptionConfiguration')
        .addAllResources()
    )

    pipeline.addToRolePolicy(
      new iam.PolicyStatement()
        .allow()
        .addActions('sns:Publish')
        .addResources(resources.buildNotificationTopic)
    )

    pipeline.addToRolePolicy(
      new iam.PolicyStatement()
        .allow()
        .addActions('cloudformation:List*')
        .addActions('cloudformation:Get*')
        .addActions('cloudformation:PreviewStackUpdate')
        .addActions('cloudformation:ValidateTemplate')
        .addActions('cloudformation:CreateStack')
        .addActions('cloudformation:CreateUploadBucket')
        .addActions('cloudformation:DeleteStack')
        .addActions('cloudformation:Describe*')
        .addActions('cloudformation:UpdateStack')
        .addAllResources()
    )

    pipeline.addToRolePolicy(
      new iam.PolicyStatement()
        .allow()
        .addActions('codebuild:StartBuild')
        .addActions('codebuild:BatchGetBuilds')
        .addActions('codebuild:StopBuild')
        .addAllResources()
    )

    return {
      ...resources,
      pipeline
    }
  }
}
