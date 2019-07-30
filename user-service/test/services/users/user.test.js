'use strict'

const path = require('path')
const awsMock = require('aws-sdk-mock')
const { test } = require('tap')

awsMock.setSDK(path.resolve('./node_modules/aws-sdk'))
process.env.USER_POOL_ID = 'User_pool123'

const testEmail = 'email@example.com'

const user = {
  Users: [{ Username: '123' }]
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

awsMock.mock('CognitoIdentityServiceProvider', 'listUsers', function(
  params,
  callback
) {
  callback(null, user)
})

test('user service retrieves cognito user information', async t => {
  const userService = require('../../../services/users/user')
  const response = await userService.get({
    userId: 'userId'
  })
  t.match(response, {
    email: testEmail
  })

  // Run again to test pre-cached user ID
  const responser2 = await userService.get({
    userId: 'userId'
  })
  t.match(responser2, {
    email: testEmail
  })
})
