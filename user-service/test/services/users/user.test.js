'use strict'

const path = require('path')
const awsMock = require('aws-sdk-mock')
const { test } = require('tap')

awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
process.env.USER_POOL_ID = 'User_pool123'

const testEmail = 'email@example.com'

const uid = {
  userId: 'userId'
}

awsMock.mock('SSM', 'getParameter', function(params, callback) {
  callback(null, { Parameter: { Value: 'test-user-pool-id' } })
})

awsMock.mock('CognitoIdentityServiceProvider', 'adminGetUser', function(
  params,
  callback
) {
  const UserAttributes = [{ Name: 'email', Value: testEmail }]
  callback(null, { UserAttributes })
})

test('user service retrieves cognito user information', async t => {
  const userService = require('../../../services/users/user')
  const response = await userService.get(uid)
  t.match(response, {
    email: testEmail
  })
})
