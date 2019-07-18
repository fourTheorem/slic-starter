'use strict'
const { getUser } = require('slic-tools/get')
const log = require('slic-tools/log')
const { createResponse } = require('slic-tools/response')
const { processEvent } = require('slic-tools/event-util')
const { getSSMValue } = require('./lib/getSSMValue')
const crypto = require('crypto')
const { createShareAcceptedEvent } = require('slic-tools/event-dispatcher')

async function main(event) {
  const { body } = processEvent(event)
  const { code } = body

  log.info('in main, code is: ', code)
  const SECRET = await getSSMValue()

  const codeBuffer = Buffer.from(code, 'base64')
  const digestBuffer = codeBuffer.subarray(0, 32)

  const dataBuffer = codeBuffer.subarray(32)

  const hmac = crypto.createHmac('sha256', SECRET)

  hmac.update(dataBuffer)
  
  log.info('updated HMAC, ', hmac)
  
  const digest = hmac.digest()

  log.info('digest: ', digest.toString('hex'))
  log.info('digestBuffer: ', digestBuffer.toString('hex')) 

  if (!digest.equals(digestBuffer)) {
    throw new Error('Digest Mismatch Error')
  }

  const listId = bufferToValue(databuffer.subarray(0, 16))
  const userId = bufferToValue(databuffer.subarray(16, 32))
  const email = dataBuffer.subarray(32).toString('utf8')

  log.info('attempting to create cloudwatch event')
  await createShareAcceptedEvent(userId, listId, email)  

}

function bufferToValue(buffer) {
  return [
    buffer.subarray(0, 4).toString('hex'),
    buffer.subarray(4, 6).toString('hex'),
    buffer.subarray(6, 8).toString('hex'),
    buffer.subarray(8, 10).toString('hex'),
    buffer.subarray(10).toString('hex')
  ].join('-')
}


module.exports = {
  main
}
