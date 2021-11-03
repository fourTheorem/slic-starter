'use strict'

const { AWS } = require('slic-tools/aws')
const awsXray = require('aws-xray-sdk-core')

const log = require('slic-tools/log')

const cognitoCore = new AWS.CognitoIdentityServiceProvider()
/* istanbul ignore next */
const cognito = process.env.SLIC_STAGE === 'test' ? cognitoCore : awsXray.captureAWSClient(cognitoCore)

async function get ({ userId }) {
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
