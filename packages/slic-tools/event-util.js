import get from 'lodash/get.js';
import bourne from '@hapi/bourne'; // Used instead of JSON.parse to protect against protype poisoning

import { log } from './log.js';

/*
 * Utilities for Lambda events
 */

export function processEvent(event) {
  const { body, pathParameters, queryStringParameters, requestContext } = event;
  const { httpMethod, resourceId, resourcePath, requestId } = requestContext;
  // The following works for offline mode as well as real
  // lambda-proxy with cognito user pool authorization
  // if the 'cognito:username' is set in a JWT-encoded Authorization token
  const userId = get(requestContext, 'authorizer.claims.cognito:username');
  log.debug(
    { resourceId, resourcePath, requestId, httpMethod, userId },
    'Request received'
  );

  return {
    body: typeof body === 'string' ? bourne.parse(body) : body,
    queryStringParameters,
    pathParameters,
    userId,
  };
}
