import cdk = require('@aws-cdk/core')
import { CfnApplication } from '@aws-cdk/aws-sam'

export default class PipelineDashboard extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)
    new CfnApplication(scope, `${id}App`, {
      location: {
        applicationId:
          'arn:aws:serverlessrepo:us-east-1:923120264911:applications/pipeline-dashboard',
        semanticVersion: '0.0.8'
      },
      parameters: {
        PipelinePattern: '*'
      }
    })
  }
}
