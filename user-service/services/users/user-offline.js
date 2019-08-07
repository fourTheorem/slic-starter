'use strict'

const { extractEmail } = require('mock-amplify-auth')

function get({ userId }) {
  return {
    userId,
    email: extractEmail(userId)
  }
}

module.exports = {
  get
}
