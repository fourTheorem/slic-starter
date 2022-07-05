import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import AWSXRay from 'aws-xray-sdk-core';

const defaultOptions = {
  // Prevent long-running retry loops caused by the default SDK DDB retry count of 10 with
  // exponential backoff with deals up to 25 seconds
  maxAttempts: 4,
};

/*
 * Adapted from https://github.com/99xt/serverless-dynamodb-client/blob/master/index.js
 */
const localDynamoPort = process.env.DYNAMODB_LOCAL_PORT || 8000;

const options = process.env.IS_OFFLINE
  ? {
      region: 'localhost',
      endpoint: `http://localhost:${localDynamoPort}`,
      ...defaultOptions,
    }
  : defaultOptions;

const dynamoDbClient = new DynamoDBClient(options);
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
  },
});

/* istanbul ignore next */
const ddb =
  process.env.IS_OFFLINE || process.env.SLIC_STAGE === 'test'
    ? dynamoDbDocClient
    : AWSXRay.captureAWSv3Client(dynamoDbDocClient); // TODO - Revisit this to enable XRay always

export function dynamoDocClient() {
  return ddb;
}
