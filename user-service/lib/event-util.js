'use strict'

const get = require('lodash/get')
const bourne = require('bourne') // Used instead of JSON.parse to protect against protype poisoning

const log = require('./log')

/*
 * Utilities for Lambda events
 */

function processEvent(event) {
  const { body, pathParameters, queryStringParameters, requestContext } = event
  const { httpMethod, resourceId, resourcePath, requestId } = requestContext

  return {
    body: body && bourne.parse(body),
    queryStringParameters,
    pathParameters
  }
}

module.exports = {
  processEvent
}
