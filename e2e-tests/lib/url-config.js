const localConfig = require('./local-email-config.js')
const prodConfig = require('./prod-email-config.js')

const stage = process.env.SLIC_STAGE

const emailArr = []
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
  let retriever
  let email

  if (stage === 'local') {
    retriever = localConfig
  } else {
    retriever = prodConfig
  }

  email = retriever.generateEmailAddress()
  storeEmail(email)
  return email
}

export function getCode(email) {
  switch (stage) {
    case 'local':
      return localConfig.retrieveCode(email)

    default:
      return prodConfig.retrieveCode(email).then(result => {
        return result
      })
  }
}

function storeEmail(email) {
  emailArr.push(email)
}

export function getEmailStore() {
  return emailArr
}
