const { v4: uuid } = require('uuid')
const { mockClient } = require('aws-sdk-client-mock')
const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider')
const t = require('tap')

const userService = require('../../../services/users/user')

process.env.USER_POOL_ID = 'User_pool123'
const testEmail = 'email@example.com'

const cognitoMock = mockClient(CognitoIdentityProviderClient)

t.beforeEach(async function () {
  await cognitoMock.reset()
  cognitoMock.on(AdminGetUserCommand).resolves({ UserAttributes: [{ Name: 'email', Value: testEmail }] })
})

t.test('user service retrieves cognito user information', async t => {
  const userId = uuid()

  const response = await userService.get({
    userId
  })
  t.match(response, {
    email: testEmail
  })

  // Run again to test pre-cached user ID
  const response2 = await userService.get({
    userId
  })
  t.match(response2, {
    email: testEmail
  })

  t.equal(cognitoMock.send.callCount, 2)
  t.same(cognitoMock.send.firstCall.args[0].input, {
    UserPoolId: 'User_pool123',
    Username: userId
  })
})
