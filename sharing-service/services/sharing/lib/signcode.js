const crypto = require('crypto')

const {getSSMValue} = import('./getSSMValue.js')
const listId = '23538fda-ab6c-44c5-a5da-adb56e795950'
const userId = '0c796e4e-607b-4dad-a912-4427bff5eabc'
const email = 'paul.kevany@fourtheorem.com'
const AWS = require('aws-sdk')
const SSM = new AWS.SSM()

async function createSignedLink(listId, userId, email) {
  const SECRET = await getSSMValue()
  const bufferConcat = Buffer.concat([
    Buffer.from(listId.replace(/-/g, ''), 'hex'),
    Buffer.from(userId.replace(/-/g, ''), 'hex'),
    Buffer.from(email)
  ])

  const hmac = crypto.createHmac('sha256', SECRET)

  hmac.update(bufferConcat)

  const digest = hmac.digest()

  console.log('Digest', digest.toString('hex'))

  const code = Buffer.concat([digest, bufferConcat])
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  console.log('secret: ', SECRET)
  console.log(code)

}

createSignedLink(listId, userId, email)

module.exports = {
  createSignedLink
}
