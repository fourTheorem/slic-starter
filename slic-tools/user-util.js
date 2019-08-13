'use strict'

const signedAxios = require('aws-signed-axios')

async function getUser(userId) {
  const userServiceUrl = process.env.USER_SERVICE_URL
  if (!userServiceUrl) {
    throw new Error('USER_SERVICE_URL is not defined')
  }

  const userUrl = `${userServiceUrl}${userId}`
  const { data: result } = await signedAxios({
    method: 'GET',
    url: userUrl
  })
  return result
}

module.exports = {
  getUser
}
