'use strict'

const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')
const generateEmail = require('../../common-lib/real-email-config')

const chance = require('chance').Chance()
const { rword } = require('rword')

const { loadBackendConfig } = require('./backend-config')

const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider()

const generatePassword = () => `${chance.string({ length: 10 })}!Aa0`

async function createUser() {
  const email = generateEmail.generateEmailAddress()
  //TODO: replace generateEmail.generateEmailAddress() with the line below this one.
  //`${rword.generate(3).join('-')}@example.com`
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

  const { 'cognito:username': userId } = jwt.decode(
    challengeResponse.AuthenticationResult.IdToken
  )

  const user = {
    userId,
    email,
    username: email,
    accessToken: challengeResponse.AuthenticationResult.AccessToken,
    idToken: challengeResponse.AuthenticationResult.IdToken
  }
  return user
}

async function deleteUser(user) {
  const backendConfig = await loadBackendConfig()
  const deleteRequest = {
    UserPoolId: backendConfig.userPoolId,
    Username: user.email
  }
  await cognitoServiceProvider.adminDeleteUser(deleteRequest).promise()
}

module.exports = {
  createUser,
  deleteUser
}
