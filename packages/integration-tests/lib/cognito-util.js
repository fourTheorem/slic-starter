const {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  CognitoIdentityProviderClient,
} = require('@aws-sdk/client-cognito-identity-provider');
const awscred = require('awscred');
const jwt = require('jsonwebtoken');
const chance = require('chance').Chance();

const { generateEmailAddress } = require('test-common/real-email-config');
const { loadBackendConfig } = require('./backend-config');

const generatePassword = () => `${chance.string({ length: 10 })}!Aa0`;

const awsRegion = awscred.loadRegionSync();
const cognitoServiceProvider = new CognitoIdentityProviderClient({
  region: awsRegion,
});

async function createUser() {
  const email = generateEmailAddress();
  const password = generatePassword();

  const backendConfig = await loadBackendConfig();

  const createRequest = {
    UserPoolId: backendConfig.userPoolId,
    Username: email,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  };

  await cognitoServiceProvider.send(new AdminCreateUserCommand(createRequest));

  const authRequest = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: backendConfig.userPoolId,
    ClientId: backendConfig.userPoolClientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const authResponse = await cognitoServiceProvider.send(
    new AdminInitiateAuthCommand(authRequest)
  );

  const challengeRequest = {
    UserPoolId: backendConfig.userPoolId,
    ClientId: backendConfig.userPoolClientId,
    ChallengeName: authResponse.ChallengeName,
    Session: authResponse.Session,
    ChallengeResponses: {
      USERNAME: email,
      NEW_PASSWORD: generatePassword(),
    },
  };

  const challengeResponse = await cognitoServiceProvider.send(
    new AdminRespondToAuthChallengeCommand(challengeRequest)
  );

  const { 'cognito:username': userId } = jwt.decode(
    challengeResponse.AuthenticationResult.IdToken
  );

  const user = {
    userId,
    email,
    username: email,
    accessToken: challengeResponse.AuthenticationResult.AccessToken,
    idToken: challengeResponse.AuthenticationResult.IdToken,
  };
  return user;
}

async function deleteUser(user) {
  const backendConfig = await loadBackendConfig();
  const deleteRequest = {
    UserPoolId: backendConfig.userPoolId,
    Username: user.email,
  };
  await cognitoServiceProvider.send(new AdminDeleteUserCommand(deleteRequest));
}

module.exports = {
  createUser,
  deleteUser,
};
