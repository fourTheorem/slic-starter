import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import AWSXray from 'aws-xray-sdk-core';
import { log } from 'slic-tools';

const cognitoCore = new CognitoIdentityProviderClient({});
const cognitoClient =
  process.env.SLIC_STAGE === 'test'
    ? cognitoCore
    : /* c8 ignore next */ AWSXray.captureAWSv3Client(cognitoCore);

export async function get({ userId }) {
  const params = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId,
  };
  log.info({ params }, 'User Pool Parameters');

  const cognitoUser = await cognitoClient.send(new AdminGetUserCommand(params));
  log.info({ cognitoUser }, 'Got user');
  const result = {};
  for (const { Name, Value } of cognitoUser.UserAttributes) {
    result[Name] = Value;
  }

  log.info({ result }, 'Got user attributes');
  return result;
}
