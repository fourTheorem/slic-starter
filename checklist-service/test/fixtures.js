'use strict'

const userId = 'testUser'

const userRequestContext = {
  authorizer: {
    claims: {
      'cognito:username': userId
    }
  }
}

module.exports = {
  userId,
  userRequestContext
}
