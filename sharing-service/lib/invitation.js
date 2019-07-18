'use strict'

const crypto = require('crypto')
const log = require('slic-tools/log')

const AWS = require('aws-sdk')
const SSM = new AWS.SSM()

module.exports = function invitation(secret) {
  function createCode({ listId, userId, email }) {
    if (!listId || !userId || !email) {
      throw new Error('Failed to retrieve required valued for code signing')
    }
    const bufferConcat = Buffer.concat([
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

  function parseCode(code) {
    const normalized = code
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const padded = normalized + Array(5 - normalized.length % 4).join('=')
    const codeBuffer = Buffer.from(padded, 'base64')
    const digestBuffer = codeBuffer.subarray(0, 32)

    const dataBuffer = codeBuffer.subarray(32)

    const hmac = crypto.createHmac('sha256', secret)

    hmac.update(dataBuffer)

    const digest = hmac.digest()

    if (!digest.equals(digestBuffer)) {
      throw new Error('Digest Mismatch Error')
    }

    const listId = bufferToValue(dataBuffer.subarray(0, 16))
    const userId = bufferToValue(dataBuffer.subarray(16, 32))
    const email = dataBuffer.subarray(32).toString('utf8')

    return { listId, userId, email }
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

  return {
    createCode,
    parseCode
  }
}
