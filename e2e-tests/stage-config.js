const localRetriever = require('./LocalRetriever')
const realRetriever = require('./RealRetriever')

const stage = process.env.SLIC_STAGE

const emailArr = []
export function getURLFromStage() {
  let domainPrefix
  let baseDomain
  let url

  switch (stage) {
    case 'local':
      domainPrefix = ''
      baseDomain = 'localhost:3000'
      url = domainPrefix.concat(baseDomain)
      break

    case 'dev':
      domainPrefix = 'dev.'
      baseDomain = 'sliclists.com'
      url = domainPrefix.concat(baseDomain)
      break

    case 'prod':
      domainPrefix = ''
      baseDomain = 'sliclists.com'
      url = domainPrefix.concat(baseDomain)
      break

    case 'stg':
      domainPrefix = 'stg.'
      baseDomain = 'sliclists.com'
      url = domainPrefix.concat(baseDomain)
      break

    default:
      domainPrefix = ''
      baseDomain = 'sliclists.com'
      url = domainPrefix.concat(baseDomain)
      break
  }

  return url
}

export function getEmail() {
  let retriever
  let email

  switch (stage) {
    case 'local':
      retriever = localRetriever
      break

    default:
      retriever = realRetriever
      break
  }

  email = retriever.generateEmailAddress()
  emailStore(email)
  return email
}

export function getCode(email) {
  switch (stage) {
    case 'local':
      return localRetriever.retrieveCode(email)

    default:
      return realRetriever.retrieveCode(email).then(result => {
        return result
      })
  }
}

function emailStore(email) {
  emailArr.push(email)
}

export function getEmailStore() {
  return emailArr
}
