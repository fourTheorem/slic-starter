'use strict'

const userId = 'userId123'

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
