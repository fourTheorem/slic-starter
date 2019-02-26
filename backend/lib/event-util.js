'use strict'

const get = require('lodash/get')
const bourne = require('bourne') // Used instead of JSON.parse to protect against protype poisoning

const log = require('../../lib/log')

/*
 * Utilities for Lambda events
 */

function processEvent(event) {
  const { body, requestContext } = event
  const {
    httpMethod,
    pathParameters,
    resourceId,
    resourcePath,
    requestId
  } = requestContext
  const userId = get(requestContext, 'authorizer.claims.cognito:username')

  log.info(
    { resourceId, resourcePath, requestId, httpMethod, userId },
    'Request received'
  )

  return {
    body: body && bourne.parse(body),
    pathParameters,
    userId
  }
}

module.exports = {
  processEvent
}
