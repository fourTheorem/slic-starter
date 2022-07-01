const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { captureAWSv3Client } = require('aws-xray-sdk-core');

const log = require('slic-tools/log');

const cognitoCore = new CognitoIdentityProviderClient({});
/* istanbul ignore next */
const cognitoClient =
  process.env.SLIC_STAGE === 'test'
    ? cognitoCore
    : captureAWSv3Client(cognitoCore);

async function get({ userId }) {
  const params = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId,
  };
  log.info({ params }, 'User Pool Parameters');

  const cognitoUser = await cognitoClient.send(new AdminGetUserCommand(params));
  log.info({ cognitoUser }, 'Got user');
  const result = {};
  cognitoUser.UserAttributes.forEach(({ Name, Value }) => {
    result[Name] = Value;
  });
  log.info({ result }, 'Got user attributes');
  return result;
}

module.exports = { get };
