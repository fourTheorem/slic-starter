const localConfig = require('./local-email-config.js')
const realConfig = require('./real-email-config.js')

const stage = process.env.SLIC_STAGE
export function getBaseURL() {
  let url
  const domainSuffix = stage === 'prod' ? '' : `${stage}.`

  if (stage === 'local') {
    url = 'http://localhost:3000'
  } else {
    url = `https://${domainSuffix}sliclists.com`
  }

  return url
}

export function getEmail() {
  let config
  let email
  if (stage === 'local') {
    config = localConfig
  } else {
    config = realConfig
  }

  email = config.generateEmailAddress()
  return email
}

export function getCode(email) {
  switch (stage) {
    case 'local':
      return localConfig.retrieveCode(email)

    default:
      return realConfig.retrieveCode(email).then(result => {
        return result
      })
  }
}
