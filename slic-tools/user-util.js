'use strict'

const signedAxios = require('aws-signed-axios')

async function getUser(userId) {
  const userUrl = `${process.env.USER_SERVICE_URL}${userId}`

  const { data: result } = await signedAxios({
    method: 'GET',
    url: userUrl
  })
  return result
}

module.exports = {
  getUser
}
