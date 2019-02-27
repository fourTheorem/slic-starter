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
  // The following works for offline mode as well as real
  // lambda-proxy with cognito user pool authorization
  // if the 'cognito:username' is set in a JWT-encoded Authorization token
  const userId = get(requestContext, 'authorizer.claims.cognito:username')
  log.info(
    { resourceId, resourcePath, requestId, httpMethod, userId },
    'Request received'
  )

  return {
    body: body && bourne.parse(body),
    queryStringParameters,
    pathParameters,
    userId
  }
}

module.exports = {
  processEvent
}
