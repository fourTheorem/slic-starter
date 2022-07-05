import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import awscred from 'awscred';
import jwt from 'jsonwebtoken';
import { Chance } from 'chance';

import { generateEmailAddress } from 'test-common/real-email-config';
import { loadBackendConfig } from './backend-config.js';

const generatePassword = () => `${Chance().string({ length: 10 })}!Aa0`;

const awsRegion = awscred.loadRegionSync();
const cognitoServiceProvider = new CognitoIdentityProviderClient({
  region: awsRegion,
});

export async function createUser() {
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

export async function deleteUser(user) {
  const backendConfig = await loadBackendConfig();
  const deleteRequest = {
    UserPoolId: backendConfig.userPoolId,
    Username: user.email,
  };
  await cognitoServiceProvider.send(new AdminDeleteUserCommand(deleteRequest));
}
