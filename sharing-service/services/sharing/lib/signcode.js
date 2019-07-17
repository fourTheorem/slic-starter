const crypto = require('crypto')
const log = require('slic-tools/log')

const getSSMValue = require('./getSSMValue.js')
const AWS = require('aws-sdk')
const SSM = new AWS.SSM()

async function createSignedLink(listId, collaboratorUserId, email) {
  if (!listId || !collaboratorUserId || !email) {
      throw new Error('Failed to retrieve required valued for code signing')
  }
  const SECRET = await getSSMValue.getSSMValue()
  log.info('got secret: ', SECRET)
  const bufferConcat = Buffer.concat([
    Buffer.from(listId.replace(/-/g, ''), 'hex'),
    Buffer.from(collaboratorUserId.replace(/-/g, ''), 'hex'),
    Buffer.from(email)
  ])

  const hmac = crypto.createHmac('sha256', SECRET)

  const digest = hmac.digest()

  console.log('Digest', digest.toString('hex'))

  const code = Buffer.concat([digest, bufferConcat])
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  console.log('secret: ', SECRET.toString())
  console.log(code)
  return code
}

module.exports = {
  createSignedLink
}
