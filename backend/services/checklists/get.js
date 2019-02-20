'use strict'

const { createResponse } = require('../../lib/response')
const log = require('../../lib/log')
const checklist = require('./checklist')

async function main(event) {
  const { pathParameters, requestContext } = event
  log.info({ requestContext }, 'Get request received')
  const userId = requestContext.identity.cognitoIdentityId
  const { id: listId } = pathParameters

  return await createResponse(checklist.get({ listId, userId }))
}

module.exports = { main }
