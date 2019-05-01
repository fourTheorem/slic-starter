import fs = require('fs')
import path = require('path')

import cdk = require('@aws-cdk/cdk')
import lambda = require('@aws-cdk/aws-lambda')
import sf = require('@aws-cdk/aws-stepfunctions')
import {
  BuildEnvironmentVariable,
  BuildEnvironmentVariableType
} from '@aws-cdk/aws-codebuild'
import { SourceProject } from './projects/source-project'
import CodeBuildRole from './code-build-role'
import { Bucket } from '@aws-cdk/aws-s3'
import BuildModulesStage from './stages/build-modules-stage'

import modules from '../modules'
import StageName from './stage-name'
const { stages } = modules

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const runCodeBuildFunction = new lambda.Function(this, 'runCodeBuild', {
      runtime: lambda.Runtime.NodeJS810,
      handler: 'index.handler',
      code: lambda.Code.inline(
        fs.readFileSync(
          path.join(__dirname, 'tasks', 'run-codebuild.js'),
          'utf-8'
        )
      )
    })

    const codeBuildRole = new CodeBuildRole(this, 'stageBuildRole')

    stages.forEach((stageModules, index) => {
      const stageNo = index + 1
      const buildModuleStage = new BuildModulesStage(this, {
        stageNo,
        stageModules,
        stageName: StageName.stg,
        codeBuildRole,
        runCodeBuildFunction
      })

      resources.stgDeployModulesStage = new DeployModulesStage(
        this,
        stageNo,
        stageModules,
        resources,
        StageName.stg
      )
    })

    const stateMachine = new sf.StateMachine(this, 'pipelineStateMachine', {
      definition: task,
      stateMachineName: 'SLICPipeline'
    })

    const sourceCodeBuildRole = new CodeBuildRole(this, 'sourceCodeBuildRole', {
      pipelineStateMachine: stateMachine
    })

    const stateMachineArnEnv: BuildEnvironmentVariable = {
      type: BuildEnvironmentVariableType.PlainText,
      value: stateMachine.stateMachineArn
    }

    const artifactsBucket = new Bucket(this, 'artifactsBucket', {
      bucketName: `slic-build-artifacts-${this.env.account}-${this.env.region}`
    })

    new SourceProject(this, 'sourceProject', {
      projectName: 'SLICPipelineSource',
      role: sourceCodeBuildRole,
      bucket: artifactsBucket,
      environmentVariables: {
        PIPELINE_STEP_FUNCTION_ARN: stateMachineArnEnv
      }
    })
  }
}
