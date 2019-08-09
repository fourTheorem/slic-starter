'use strict'

const crypto = require('crypto')

module.exports = function invitation(secret) {
  return {
    createCode,
    parseCode: code => parseCode(code, secret)
  }

  function createCode({ listName, listId, userId, email }) {
    if (!listName || !listId || !userId || !email) {
      throw new Error('Invalid parameters for invitation code')
    }
    const lenBuf = Buffer.allocUnsafe(1)
    lenBuf.writeUInt8(listName.length)
    const bufferConcat = Buffer.concat([
      lenBuf,
      Buffer.from(listName),
      Buffer.from(listId.replace(/-/g, ''), 'hex'),
      Buffer.from(userId.replace(/-/g, ''), 'hex'),
      Buffer.from(email)
    ])

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(bufferConcat)

    const digest = hmac.digest()

    const code = Buffer.concat([digest, bufferConcat])
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    return code
  }
}

function parseCode(code, secret) {
  const normalized = code.replace(/-/g, '+').replace(/_/g, '/')
  const codeBuffer = Buffer.from(normalized, 'base64')
  const digestBuffer = codeBuffer.subarray(0, 32)
  const dataBuffer = codeBuffer.subarray(32)

  if (secret) {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(dataBuffer)
    const digest = hmac.digest()
    if (!digest.equals(digestBuffer)) {
      throw new Error('Digest Mismatch Error')
    }
  }

  const listNameLength = dataBuffer.readUInt8()
  const listName = dataBuffer.subarray(1, listNameLength + 1).toString()
  const listId = bufferToUuid(
    dataBuffer.subarray(listNameLength + 1, listNameLength + 17)
  )
  const userId = bufferToUuid(
    dataBuffer.subarray(listNameLength + 17, listNameLength + 33)
  )
  const email = dataBuffer.subarray(listNameLength + 33).toString('utf8')

  return { listName, listId, userId, email }
}

function bufferToUuid(buffer) {
  return [
    buffer.subarray(0, 4).toString('hex'),
    buffer.subarray(4, 6).toString('hex'),
    buffer.subarray(6, 8).toString('hex'),
    buffer.subarray(8, 10).toString('hex'),
    buffer.subarray(10).toString('hex')
  ].join('-')
}

module.exports.parseCode = parseCode
