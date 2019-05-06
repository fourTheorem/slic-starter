import fs = require('fs')
import path = require('path')

import cdk = require('@aws-cdk/cdk')
import lambda = require('@aws-cdk/aws-lambda')
import sf = require('@aws-cdk/aws-stepfunctions')
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'
import { SourceProject } from './projects/source-project'
import CodeBuildRole from './code-build-role'
import { Bucket } from '@aws-cdk/aws-s3'
import { PolicyStatement } from '@aws-cdk/aws-iam'
import BuildModulesStage from './stages/build-modules-stage'

import modules from '../modules'
import StageName from './stage-name'
import DeployModulesStage from './stages/deploy-modules-stage'

const { stages } = modules

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const runCodeBuildFunction = new lambda.Function(this, 'runCodeBuild', {
      functionName: 'runCodeBuild',
      runtime: lambda.Runtime.NodeJS810,
      handler: 'index.handler',
      code: lambda.Code.inline(
        fs.readFileSync(
          path.join(__dirname, 'tasks', 'run-codebuild.js'),
          'utf-8'
        )
      )
    })
    runCodeBuildFunction.addToRolePolicy(
      new PolicyStatement()
        .allow()
        .addAction('codeBuild:StartBuild')
        .addAllResources()
    )

    const checkCodeBuildFunction = new lambda.Function(this, 'checkCodeBuild', {
      functionName: 'checkCodeBuild',
      runtime: lambda.Runtime.NodeJS810,
      handler: 'index.handler',
      code: lambda.Code.inline(
        fs.readFileSync(
          path.join(__dirname, 'tasks', 'check-codebuild.js'),
          'utf-8'
        )
      )
    })
    checkCodeBuildFunction.addToRolePolicy(
      new PolicyStatement()
        .allow()
        .addAction('codeBuild:BatchGetBuilds')
        .addAllResources()
    )

    const artifactsBucket = new Bucket(this, 'artifactsBucket', {
      bucketName: `slic-build-artifacts-${this.env.account}-${this.env.region}`
    })

    const codeBuildRole = new CodeBuildRole(this, 'stageBuildRole')

    const buildModuleStages: BuildModulesStage[] = []
    const deployModuleStages: DeployModulesStage[] = []

    stages.forEach((stageModules, index) => {
      const stageNo = index + 1
      buildModuleStages.push(
        new BuildModulesStage(this, {
          stageNo,
          stageModules,
          stageName: StageName.stg,
          codeBuildRole,
          checkCodeBuildFunction,
          runCodeBuildFunction,
          artifactsBucket
        })
      )

      deployModuleStages.push(
        new DeployModulesStage(this, {
          stageNo,
          stageModules,
          stageName: StageName.stg,
          codeBuildRole,
          checkCodeBuildFunction,
          runCodeBuildFunction,
          artifactsBucket
        })
      )

      buildModuleStages[index].stageState.next(
        deployModuleStages[index].stageState
      )
    })

    deployModuleStages.forEach((deployModuleStage, index) => {
      if (index < deployModuleStages.length - 1) {
        deployModuleStage.stageState.next(
          buildModuleStages[index + 1].stageState
        )
      }
    })

    const stateMachine = new sf.StateMachine(this, 'pipelineStateMachine', {
      definition: buildModuleStages[0].stageState,
      stateMachineName: 'SLICPipeline'
    })

    const sourceCodeBuildRole = new CodeBuildRole(this, 'sourceCodeBuildRole', {
      pipelineStateMachine: stateMachine
    })

    new SourceProject(this, 'sourceProject', {
      projectName: 'SLICPipelineSource',
      role: sourceCodeBuildRole,
      bucket: artifactsBucket,
      environmentVariables: {
        PIPELINE_STEP_FUNCTION_ARN: {
          type: BuildEnvironmentVariableType.PlainText,
          value: stateMachine.stateMachineArn
        },
        ARTIFACTS_BUCKET_NAME: {
          type: BuildEnvironmentVariableType.PlainText,
          value: artifactsBucket.bucketName
        },
        ARTIFACTS_BUCKET_ARN: {
          type: BuildEnvironmentVariableType.PlainText,
          value: artifactsBucket.bucketArn
        }
      }
    })
  }
}
