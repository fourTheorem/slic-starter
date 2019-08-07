'use strict'

const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')

const log = require('slic-tools/log')

const cognito = awsXray.captureAWSClient(
  new AWS.CognitoIdentityServiceProvider()
)

async function get({ userId }) {
  const params = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId
  }
  log.info({ params }, 'User Pool Parameters')

  const cognitoUser = await cognito.adminGetUser(params).promise()
  log.info({ cognitoUser }, 'Got user')
  const result = {}
  cognitoUser.UserAttributes.forEach(({ Name, Value }) => {
    result[Name] = Value
  })
  log.info({ result }, 'Got user attributes')
  return result
}

module.exports = { get }
