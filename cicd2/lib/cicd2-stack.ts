import * as cdk from '@aws-cdk/core';
import { PipelineStack } from './pipeline-stack';

export class Cicd2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new PipelineStack(this, 'PipelineStack');
  }
}
