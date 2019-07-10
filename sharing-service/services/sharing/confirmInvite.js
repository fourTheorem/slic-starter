'use strict'
const { getUser } = require('../../../slic-tools/user-tools/get')
const { createResponse } = require('../../../slic-tools/response')
const share = require('./share')
const { processEvent } = require('../../../slic-tools/event-util')
const { getSSMValue } = require('./lib/getSSMValue')
const crypto = require('crypto')

async function main(event) {
  const { body } = processEvent(event)
  const { code } = body

  const SECRET = await getSSMValue()

  const codeBuffer = Buffer.from(code, 'base64')
  const digestBuffer = codeBuffer.subarray(0, 32)

  const dataBuffer = codeBuffer.subarray(32)

  const hmac = crypto.createHmac('sha256', SECRET)

  hmac.update(dataBuffer)

  const digest = hmac.digest()

  if (!digest.equals(digestBuffer)) {
    throw new Error('Digest Mismatch Error')
  }

  const listId = bufToValue(databuffer.subarray(0, 16))
  const userId = bufToValue(databuffer.subarray(16, 32))
  const email = dataBuffer.subarray(32).toString('utf8')
}

function bufToValue(buffer) {
  return [
    buffer.subarray(0, 4).toString('hex'),
    buffer.subarray(4, 6).toString('hex'),
    buffer.subarray(6, 8).toString('hex'),
    buffer.subarray(8, 10).toString('hex'),
    buffer.subarray(10).toString('hex')
  ].join('-')
}
