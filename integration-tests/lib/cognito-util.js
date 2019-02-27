'use strict'

const AWS = require('aws-sdk')
const chance = require('chance').Chance()
const { rword } = require('rword')

const { loadBackendConfig } = require('./backend-config')

const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider()

const generatePassword = () => `${chance.string({ length: 10 })}!Aa0`

async function createUser() {
  const userId = rword.generate(3).join('-')
  const email = `${userId}@example.com`
  const password = generatePassword()

  const backendConfig = await loadBackendConfig()

  const createRequest = {
    UserPoolId: backendConfig.userPoolId,
    Username: email,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
    UserAttributes: [{ Name: 'email', Value: email }]
  }

  await cognitoServiceProvider.adminCreateUser(createRequest).promise()

  const authRequest = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: backendConfig.userPoolId,
    ClientId: backendConfig.userPoolClientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  }

  const authResponse = await cognitoServiceProvider
    .adminInitiateAuth(authRequest)
    .promise()

  const challengeRequest = {
    UserPoolId: backendConfig.userPoolId,
    ClientId: backendConfig.userPoolClientId,
    ChallengeName: authResponse.ChallengeName,
    Session: authResponse.Session,
    ChallengeResponses: {
      USERNAME: email,
      NEW_PASSWORD: generatePassword()
    }
  }

  const challengeResponse = await cognitoServiceProvider
    .adminRespondToAuthChallenge(challengeRequest)
    .promise()

  return {
    username: email,
    email,
    accessToken: challengeResponse.AuthenticationResult.AccessToken,
    idToken: challengeResponse.AuthenticationResult.IdToken
  }
}

async function removeUser(user) {
  throw new Error('TODO Implement removeUser')
}

module.exports = {
  createUser,
  removeUser
}
