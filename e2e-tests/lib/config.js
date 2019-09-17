const localConfig = require('./local-email-config.js')
const realConfig = require('test-common/real-email-config')
const AWS = require('aws-sdk')
const sp = require('synchronized-promise')
const ssm = new AWS.SSM()

const stage = process.env.SLIC_STAGE

const frontendUrlPromise =
  stage === 'local'
    ? Promise.resolve('http://localhost:3000')
    : ssm
        .getParameter({ Name: `/${stage}/frontend/url` })
        .promise()
        .then(data => data.Parameter.Value)
const synchronousBaseUrl = sp(() => frontendUrlPromise)

export function getBaseURL() {
  return synchronousBaseUrl()
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
