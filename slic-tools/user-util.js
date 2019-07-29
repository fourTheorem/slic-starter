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

console.log(getUser('93ba6ea2-3d4f-40c4-acd9-44a63ffc8c3a'))

module.exports = {
  getUser,
  getUserIdFromEmail
}
