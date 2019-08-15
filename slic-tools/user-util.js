'use strict'

const signedAxios = require('aws-signed-axios')

const log = require('./log')

async function getUser(userId) {
  const userServiceUrl = process.env.USER_SERVICE_URL
  if (!userServiceUrl) {
    throw new Error('USER_SERVICE_URL is not defined')
  }

  const userUrl = `${userServiceUrl}${userId}`
  try {
    const { data: result } = await signedAxios({
      method: 'GET',
      url: userUrl
    })
    return result
  } catch(err) {
    const { data, status, headers } = err.response || {}
    if (status) {
      log.error({ data, status, headers }, 'Error retrieving user')
    }
    throw err
  }
}

module.exports = {
  getUser
}
