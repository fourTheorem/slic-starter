#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { PipelineStack } from '../stacks/pipeline-stack';
import { CrossAccountStack } from '../stacks/cross-account-stack';

const stage = 'dev' // TODO

const app = new cdk.App();
const crossAccountStack = new CrossAccountStack(app, 'CrossAccountStack', {
  env: {
    account: app.node.tryGetContext('target-account') || app.region,
    region: app.node.tryGetContext('target-region') || app.region
  }
})

new PipelineStack(app, 'PipelineStack', {
  env: {
    account: app.node.tryGetContext('deploy-account') || app.region,
    region: app.node.tryGetContext('deploy-region') || app.region
  },
  crossAccountDeployRole: crossAccountStack.crossAccountDeployRole
});
