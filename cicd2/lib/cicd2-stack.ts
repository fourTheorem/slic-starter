import cdk = require('@aws-cdk/cdk')
import iam = require('@aws-cdk/aws-iam')
import s3 = require('@aws-cdk/aws-s3')
import codePipeline = require('@aws-cdk/aws-codepipeline')
import codeBuild = require('@aws-cdk/aws-codebuild')
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import { SecretValue } from '@aws-cdk/cdk'

import { defaultEnvironment } from './code-build-environments'
import codePipelineActions = require('@aws-cdk/aws-codepipeline-actions')
import CodeBuildRole from './code-build-role'
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
        .addActions('s3:GetObjectVersion')
        .addActions('s3:PutObject')
        .addResources(buildBucket.arnForObjects('*'))
        .addAwsAccountPrincipal(`${config.accountIds.dev}`)
    )
    buildBucket.addToResourcePolicy(
      new iam.PolicyStatement()
        .addActions('s3:ListBucket')
        .addActions('s3:GetEncryptionConfiguration')
        .addResources(buildBucket.bucketArn)
        .addAwsAccountPrincipal(`${config.accountIds.dev}`)
    )
    // TODO - Alter this deletion policy once testing is complete
    const bucketResource = buildBucket.node.findChild(
      'Resource'
    ) as s3.CfnBucket
    bucketResource.options.deletionPolicy = cdk.DeletionPolicy.Delete

    return {
      buildBucket
    }
  }

  definePipeline(resources: any) {
    this.defineCodeBuildRole(resources)

    const pipeline = new codePipeline.Pipeline(this, 'pipeline', {
      pipelineName: 'SLICPipeline'
    })

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
        environment: defaultEnvironment,
        role: resources.codeBuildRole
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
    const codeBuildRole = new CodeBuildRole(this, resources, 'codeBuildRole')
    resources.codeBuildRole = codeBuildRole
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

    return {
      ...resources,
      pipeline
    }
  }
}
