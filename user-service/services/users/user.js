'use strict'

const AWS = require('aws-sdk')

const log = require('../../lib/log')

const cognito = new AWS.CognitoIdentityServiceProvider()
const poolId = process.env.USER_POOL_ID

module.exports = {
  get
}

async function get({ userId }) {
  const params = {
    UserPoolId: poolId,
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
