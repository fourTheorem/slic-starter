'use strict'

const log = require('./log')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
}

async function createResponse(promise, options) {
  const successCode = (options && options.successCode) || 200
  try {
    const result = await promise
    log.info({ result }, 'Result received')

    return {
      statusCode: successCode,
      body: JSON.stringify(result || {}),
      headers
    }
  } catch (err) {
    log.error({ err }, 'Request implementation failed')
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false }),
      headers
    }
  }
}

module.exports = {
  createResponse
}
