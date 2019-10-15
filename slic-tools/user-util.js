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
  } catch (err) {
    const response = err.response || {}
    const request = err.request || {}
    if (response.status) {
      log.error(
        {
          request: { url: request.url, headers: request.headers },
          response: {
            data: response.data,
            status: response.status,
            headers: response.headers
          }
        },
        'Error retrieving user'
      )
    }
    throw err
  }
}

module.exports = {
  getUser
}
