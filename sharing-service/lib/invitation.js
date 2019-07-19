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
    log.info({padded}, 'padded code')
    const codeBuffer = Buffer.from(normalized, 'base64')
    const digestBuffer = codeBuffer.subarray(0, 32)

    const dataBuffer = codeBuffer.subarray(32)
    log.info({dataBuffer}, 'databuffer')
    const hmac = crypto.createHmac('sha256', secret)
    log.info({hmac}, 'hmac value')
    hmac.update(dataBuffer)
    
    const digest = hmac.digest()
    log.info({digest}, 'digest value')
    if (!digest.equals(digestBuffer)) {
      throw new Error('Digest Mismatch Error')
    }
    log.info({digest}, 'digest value')
    const listId = bufferToValue(dataBuffer.subarray(0, 16))
    log.info({listId}, 'listId')
    const userId = bufferToValue(dataBuffer.subarray(16, 32))
    log.info({userId}, 'userid')
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
