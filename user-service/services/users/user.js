'use strict'

const AWS = require('aws-sdk')
const awsXray = require('aws-xray-sdk')

const log = require('slic-tools/log.js')
const { middify } = require('slic-tools/middy-util')
const cognito = awsXray.captureAWSClient(
  new AWS.CognitoIdentityServiceProvider()
)

async function get({ userId }) {
  const params = {
    UserPoolId: process.env.UserPoolId,
    Username: userId
  }
  log.info({ params }, 'params info')

  const cognitoUser = await cognito.adminGetUser(params).promise()
  log.info('Got user', cognitoUser)
  const result = {}
  cognitoUser.UserAttributes.forEach(({ Name, Value }) => {
    result[Name] = Value
  })
  log.info({ result }, 'Got user')
  return result
}

async function getUserIdByEmail(email) {
  const filter = `email = "${email}"`
  const params = {
    UserPoolId: process.env.UserPoolId,
    Filter: filter
  }
  const users = await cognito.listUsers(params).promise()

  log.info({ users }, 'Got users')
  return users.Users[0].Username
}

module.exports = middify(
  { get, getUserIdByEmail },
  {
    ssmParameters: {
      UserPoolId: 'UserPoolId'
    }
  }
)
