'use strict'

const uuid = require('uuid')

const userId = uuid.v4()

const userRequestContext = {
  authorizer: {
    claims: {
      'cognito:username': userId
    }
  }
}

const commonEventProps = {
  httpMethod: 'GET',
  headers: {}
}

module.exports = {
  userId,
  userRequestContext,
  commonEventProps
}
