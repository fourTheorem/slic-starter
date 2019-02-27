'use strict'

const jwt = require('jsonwebtoken')
const { rword } = require('rword')
const { createUser } = require('./cognito-util')

const stage = process.env.SLIC_STAGE || 'local'

let user

async function getUser() {
  if (!user) {
    if (stage === 'local') {
      const userId = rword.generate(3).join('-')
      const email = `${userId}@example.com`
      // SLIC backend with serverless-offline will derive the
      // user context by JWT-decoding the Authorization header
      user = {
        idToken: jwt.sign({ 'cognito:username': userId, email }, 'dummy-key'),
        email,
        userId
      }
    } else {
      user = await createUser()
    }
  }
  return user
}

module.exports = {
  getUser
}
