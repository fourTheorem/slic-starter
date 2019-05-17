'use strict'

const path = require('path')
const awsMock = require('aws-sdk-mock')
const { test } = require('tap')
const userId = 'Test-User'

awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
process.env.USER_POOL_ID = 'User_pool123'

const received = {
  cognito: {}
}

const uid = {
  userId: 'userId'
}

awsMock.mock('CognitoIdentityServiceProvider', 'adminGetUser', function(
  params,
  callback
) {
  const UserAttributes = [{ Name: 'email', Value: 'email@example.com' }]
  callback(null, { UserAttributes })
})

test('adminGetUser retrieves cognito user information', async t => {
  const userService = require('../../../services/users/user')
  const response = await userService.get(uid)
})
