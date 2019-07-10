'use strict'

const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')

const log = require('slic-tools/log')

const cognito = awsXray.captureAWSClient(
  new AWS.CognitoIdentityServiceProvider()
)
const SSM = awsXray.captureAWSClient(
  new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })
)

module.exports = {
  get
}

async function get({ userId }) {
  const params = {
    UserPoolId: await getUserPoolId(),
    Username: userId
  }

  const cognitoUser = await cognito.adminGetUser(params).promise()
  log.info('Got user', cognitoUser)
  const result = {}
  cognitoUser.UserAttributes.forEach(({ Name, Value }) => {
    result[Name] = Value
  })
  log.info({ result }, 'Got user')
  return result
}

let userPoolIdPromise

function getUserPoolId() {
  if (!userPoolIdPromise) {
    userPoolIdPromise = SSM.getParameter({ Name: 'UserPoolId' })
      .promise()
      .then(result => result.Parameter.Value)
  }
  return userPoolIdPromise
}

