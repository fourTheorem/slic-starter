const { getUserServiceUrl } = require('./url-retriever')
const log = require('./log')

const signedAxios = require('aws-signed-axios')

const userServiceUrlPromise = getUserServiceUrl()

async function getUser(userId) {
  const userUrl = `${await userServiceUrlPromise}${userId}`

  const { data: result } = await signedAxios({
    method: 'GET',
    url: userUrl
  })
  return result
}

async function getUserIdFromEmail(email) {
  const userUrl = `${await userServiceUrlPromise}email/${email}`

  const { data: result } = await signedAxios({
    method: 'GET',
    url: userUrl
  })
  return result
}

module.exports = {
  getUser,
  getUserIdFromEmail
}
