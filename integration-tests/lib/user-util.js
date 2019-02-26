'use strict'

const { rword } = require('rword')
const { createUser } = require('./cognito-util')

const stage = process.env.SLIC_STAGE || 'local'

let user

async function getUser() {
  if (!user) {
    if (stage === 'local') {
      const userId = rword.generate(3).join('-')
      const email = `${userId}@example.com`
      user = {
        email,
        userId
      }
    } else {
      const user = await createUser()
      // TODO - Retrieve an actual cognito user
      return {
        ...user,
        email: `${stage}@example.com`,
        userId: `${stage}User`
      }
    }
  }
  return user
}

module.exports = {
  getUser
}
