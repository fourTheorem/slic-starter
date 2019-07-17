const { getUserServiceUrl } = require('./url-retriever')
const log = require('./log')

const signedAxios = require('aws-signed-axios')

const userServiceUrlPromise = getUserServiceUrl()

async function getUser(userId) {
  log.info('In get.js getUser - getting userUrl')
  const userUrl = `${await userServiceUrlPromise}${userId}`

  log.info(' get.js got userUrl - value is ', userUrl)

  const { data: result } = await signedAxios({
    method: 'GET',
    url: userUrl
  })
  log.info('result from getUSer- ', result)
  return result

  log.info('finished')
}

async function getUserIdFromEmail(email) {
  log.info('attempting to get userId from email')
  const userUrl = `${await userServiceUrlPromise}email/${email}`

  log.info('email userUrl: ', userUrl)

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
