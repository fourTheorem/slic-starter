#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { PipelineStack } from '../stacks/pipeline-stack';
import { CrossAccountStack } from '../stacks/cross-account-stack';

const app = new cdk.App();
const stagesInput = app.node.tryGetContext('stages')
if (!stagesInput) {
  throw new Error('Stages need to be specified in CDK context. ' +
                  'Pass -c stages=dev or -c stages=stg,prd to cdk deploy. ' +
                  'CDK context variables can also be passed in cdk.json. ' +
                  'See https://docs.aws.amazon.com/cdk/latest/guide/get_context_var.html')
}
const stages = stagesInput.split(',')
const [lastStage] = stages.slice(-1)

const crossAccountDeployRoles: {[key: string]: iam.IRole} = {}

for (const stage of stages) {
  const crossAccountStack = new CrossAccountStack(app, `${stage}CrossAccountStack`, {
    env: {
      account: app.node.tryGetContext(`${stage}-account`) || app.region,
      region: app.node.tryGetContext(`${stage}-region`) || app.region
    },
    stage
  })
  crossAccountDeployRoles[stage] = crossAccountStack.crossAccountDeployRole
}

new PipelineStack(app, 'PipelineStack', {
  env: {
    account: app.node.tryGetContext('deploy-account') || app.region,
    region: app.node.tryGetContext('deploy-region') || app.region
  },
  crossAccountDeployRoles,
  stages,
  stackName:`${lastStage}PipelineStack`
})