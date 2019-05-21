'use strict'

const AWS = require('aws-sdk')

const log = require('../../lib/log')

const cognito = new AWS.CognitoIdentityServiceProvider()
const SSM = new AWS.SSM({ endpoint: process.env.SSM_ENDPOINT_URL })

module.exports = {
  get
}

async function get({ userId }) {
  const params = {
    UserPoolId: await userPoolIdPromise,
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

const userPoolIdPromise = getUserPoolId()

async function getUserPoolId() {
  const result = await SSM.getParameter({ Name: 'UserPoolId' }).promise()
  log.info({ result }, 'Got parameter')
  const {
    Parameter: { Value: userPoolId }
  } = result
  return userPoolId
}
