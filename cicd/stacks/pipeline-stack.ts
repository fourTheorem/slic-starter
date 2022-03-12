import { SecretValue, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as iam from 'aws-cdk-lib/aws-iam'
import * as codeStarConnections from 'aws-cdk-lib/aws-codestarconnections'
import * as codeBuild from 'aws-cdk-lib/aws-codebuild'
import * as codePipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codePipelineActions from 'aws-cdk-lib/aws-codepipeline-actions'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as s3 from 'aws-cdk-lib/aws-s3'

import config from '../config'
import * as ssmParams from '../ssm-params'
import modules from '../modules'
import { BuildEnvironmentVariableType, BuildSpec } from 'aws-cdk-lib/aws-codebuild'

interface PipelineStackProps extends StackProps {
  crossAccountDeployRoles: {[key: string]: iam.IRole},
  stages: string[] 
}

export class PipelineStack extends Stack {

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props)

    const stages = props.stages
    const lastStage = stages.slice(-1)

    const codeBuildEnvironment = {
      computeType: codeBuild.ComputeType.LARGE,
      buildImage: codeBuild.LinuxBuildImage.STANDARD_5_0
    }

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket')
    const pipeline = new codePipeline.Pipeline(this, `pipeline_${lastStage}`, {
      pipelineName: `${config.appName}-${lastStage}`,
      artifactBucket,
      restartExecutionOnUpdate: true // Allow the pipeline to restart if it mutates during CDK deploy
    })

    const topic = new sns.Topic(this, `${id}TopicArn`, {
      topicName: `${lastStage}PipelineNotifications`
    })

    pipeline.notifyOnExecutionStateChange(`${id}NotifyExecState`, topic)

    const bitbucketConnection = new codeStarConnections.CfnConnection(this, `${id}CodeStarConnection`, {
      connectionName: `${lastStage}CodeStarConnection`,
      providerType: 'Bitbucket'
    })

    const sourceOutput = new codePipeline.Artifact('SourceOutput')
    const sourceAction = new codePipelineActions.CodeStarConnectionsSourceAction({
      actionName: 'ButBucket',
      owner: config.sourceRepoOwner,
      repo: config.sourceRepoName,
      branch: config.sourceBranch,
      output: sourceOutput,
      connectionArn: bitbucketConnection.ref
    })

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    })


    const deployAccount = this.node.tryGetContext('deploy-account') || this.account
    const deployRegion = this.node.tryGetContext('deploy-region') || this.region

    const cdkContextArgs = [
      `--context stages=${stages.join(',')}`,
      `--context deploy-account=${deployAccount}`,
      `--context deploy-region=${deployRegion}`,
    ]

    const targetAccounts: {[stage: string]: string} = {}
    for (const stage of stages) {
      const targetAccount = this.node.tryGetContext(`${stage}-account`) || this.account
      targetAccounts[stage] = targetAccount
      const targetRegion = this.node.tryGetContext(`${stage}-region`) || this.region
      cdkContextArgs.push(...[
        `--context ${stage}-account=${targetAccount}`,
        `--context ${stage}-region=${targetRegion}`,
      ])
    }

    const synthArtifact = new codePipeline.Artifact()
    const synthProject = new codeBuild.PipelineProject(this, 'CdkSynthPipeline', {
      projectName: `${config.appName}-${lastStage}-cdk-synth`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['cd cicd', 'npm ci']
          },
          build: {
            commands: ['npm run build', `npm run cdk -- synth ${cdkContextArgs.join(' ')}`]
          },
        },
        artifacts: {
          'base-directory': 'cicd/cdk.out',
          'files': ['**/*'],
          'enable-symlinks': true,  // important for node_modules/.bin links, like `cdk` itself!
        }
      }),
      environment: codeBuildEnvironment
    })

    pipeline.addStage({
      stageName: 'CdkSynth',
      actions: [new codePipelineActions.CodeBuildAction({
        actionName: 'CdkSynth',
        project: synthProject,
        input: sourceOutput,
        outputs: [synthArtifact]
      })]
    })

    const cdkDeployProject = new codeBuild.PipelineProject(this, 'CdkDeployPipeline', {
      projectName: `${config.appName}-${lastStage}-cdk-deploy`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'npm install -g aws-cdk',
              `cdk deploy -a . --require-approval=never --verbose ${cdkContextArgs.join(' ')} "*"`
            ]
          },
        },
      }),
      environment: codeBuildEnvironment,
    })

    cdkDeployProject.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'cloudformation:DescribeStacks',
        'cloudformation:GetTemplate',
      ],
      resources: [`arn:aws:cloudformation:${deployRegion}:${deployAccount}:stack/*`],
      effect: iam.Effect.ALLOW,
    }))

    // We have more than one stack to be deployed into potentially different accounts
    // cdk deploy needs to assume the CDK deployment role in each account
    // (https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
    cdkDeployProject.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [
        `arn:*:iam::${this.account}:role/*`,
        ...([...Object.values(targetAccounts)].map(accountId => `arn:*:iam::${accountId}:role/*`))
      ],
      conditions: {
        'ForAnyValue:StringEquals': {
          'iam:ResourceTag/aws-cdk:bootstrap-role': ['image-publishing', 'file-publishing', 'deploy'],
        },
      },
    }))

    pipeline.addStage({
      stageName: 'SelfMutate',
      actions: [new codePipelineActions.CodeBuildAction({
        actionName: 'CdkDeploy',
        project: cdkDeployProject,
        input: synthArtifact,
      })]
    })

    const unitTestProject = new codeBuild.PipelineProject(this, 'UnitTests', {
      projectName: `${config.appName}-${lastStage}-unit-tests`,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: { commands: ['bash util/install-packages.sh'] },
          build: { commands: ['npm test'] },
        },
        artifacts: {
           files: '**/*',
          'enable-symlinks': true,
        }
      }),
      environment: codeBuildEnvironment
    })

    const unitTestOutput = new codePipeline.Artifact()
    pipeline.addStage({
      stageName: 'UnitTests',
      actions: [new codePipelineActions.CodeBuildAction({
        actionName: 'UnitTests',
        project: unitTestProject,
        input: sourceOutput,
        outputs: [unitTestOutput]
      })]
    })

    stages.forEach((stage, index) => {
      const targetRegion = this.node.tryGetContext(`${stage}-region`) || this.region
      const deployActions: codePipelineActions.CodeBuildAction[] = []

      modules.moduleOrder.forEach((moduleNames, index) => {
        moduleNames.forEach(moduleName => {
          const moduleDeployProject = new codeBuild.PipelineProject(
            this,
            `${moduleName}_${stage}_deploy`, {
            projectName: `${moduleName}-${stage}-deploy`,
            buildSpec: codeBuild.BuildSpec.fromObject({
              version: '0.2',
              phases: {
                install: { commands: ['bash build-scripts/build-module.sh'] },
                build: { commands: ['bash build-scripts/deploy-module.sh'] },
              }
            }),
            environment: codeBuildEnvironment,
            environmentVariables: {
              MODULE_NAME: {
                type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: moduleName
              },
              SLIC_STAGE: {
                type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: stage
              },
              TARGET_REGION: {
                type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: targetRegion
              },
              ROLE_ARN: {
                type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: props.crossAccountDeployRoles[stage].roleArn
              }
            },
          })
          moduleDeployProject.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: [props.crossAccountDeployRoles[stage].roleArn]
            }))

          const moduleDeployAction = new codePipelineActions.CodeBuildAction({
            actionName: `${moduleName}_${stage}_deploy`,
            project: moduleDeployProject,
            input: unitTestOutput,
            runOrder: index + 1
          })
          deployActions.push(moduleDeployAction)
        })
      })
      pipeline.addStage({
        stageName: `${stage}Deploy`,
        actions: deployActions
      })

      if (index < stages.length - 1) {
        const nextStage = stages[index + 1]

        const testEnvironmentVariables = {
          SLIC_STAGE: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: stage
          },
          CROSS_ACCOUNT_ID: {
            type: BuildEnvironmentVariableType.PLAINTEXT,
            value: targetAccounts[stage]
          },
          MAILOSAUR_API_KEY: {
            type: BuildEnvironmentVariableType.PARAMETER_STORE,
            value: ssmParams.Test.MAILOSAUR_API_KEY
          },
          MAILOSAUR_SERVER_ID: {
            type: BuildEnvironmentVariableType.PARAMETER_STORE,
            value: ssmParams.Test.MAILOSAUR_SERVER_ID
          },
          ROLE_ARN: {
            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.crossAccountDeployRoles[stage].roleArn
          }
        }

        const e2eTestProject = new codeBuild.PipelineProject(this, `${stage}E2ETests`, {
          projectName: `${stage}-e2e-tests`,
          environmentVariables: testEnvironmentVariables,
          buildSpec: BuildSpec.fromSourceFilename('e2e-tests/buildspec.yml'),
        })
        e2eTestProject.role?.addToPrincipalPolicy(
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [props.crossAccountDeployRoles[stage].roleArn]
          }))

        const apiTestProject = new codeBuild.PipelineProject(this, `${stage}ApiTests`, {
          projectName: `${stage}-api-tests`,
          environmentVariables: testEnvironmentVariables,
          buildSpec: BuildSpec.fromSourceFilename('e2e-tests/buildspec.yml'),
        })
        apiTestProject.role?.addToPrincipalPolicy(
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [props.crossAccountDeployRoles[stage].roleArn]
          }))
        
        pipeline.addStage({
          stageName: `${stage}Testing`,
          actions: [
            new codePipelineActions.CodeBuildAction({
              actionName: `${stage}E2ETests`,
              project: e2eTestProject,
              input: unitTestOutput,
            }),
            new codePipelineActions.CodeBuildAction({
              actionName: `${stage}ApiTests`,
              project: apiTestProject,
              input: unitTestOutput,
            })
          ]
        })

        pipeline.addStage({
          stageName: `${nextStage}Approve`,
          actions: [new codePipelineActions.ManualApprovalAction({
            actionName: `${nextStage}Approve`,
            notificationTopic: topic
          })]
        })
      }
    })
  }
}