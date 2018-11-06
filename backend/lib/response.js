'use strict'

const log = require('./log')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
}

async function createResponse(promise, options = { successCode: 200 }) {
  try {
    const result = await promise
    return {
      statusCode: options.successCode,
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
