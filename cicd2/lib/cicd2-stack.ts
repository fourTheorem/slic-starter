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

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const checkForChangesLambda = new lambda.Function(
      this,
      'checkForChangesFn',
      {
        runtime: lambda.Runtime.NodeJS810,
        handler: 'index.handler',
        code: lambda.Code.inline(
          fs.readFileSync(
            path.join(__dirname, 'tasks', 'run-codebuild.js'),
            'utf-8'
          )
        )
      }
    )

    const task = new sf.Task(this, 'checkForChanges', {
      timeoutSeconds: 600,
      resource: checkForChangesLambda
    })

    const stateMachine = new sf.StateMachine(this, 'pipelineStateMachine', {
      definition: task,
      stateMachineName: 'SLICPipeline'
    })

    const codeBuildRole = new CodeBuildRole(this)
    const stateMachineArnEnv: BuildEnvironmentVariable = {
      type: BuildEnvironmentVariableType.PlainText,
      value: stateMachine.stateMachineArn
    }

    new SourceProject(this, 'sourceProject', {
      role: codeBuildRole,
      environmentVariables: {
        PIPELINE_STEP_FUNCTION_ARN: stateMachineArnEnv
      }
    })
  }
}
