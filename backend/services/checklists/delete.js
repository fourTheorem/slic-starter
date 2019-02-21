'use strict'

const { createResponse } = require('../../lib/response')
const log = require('../../lib/log')
const checklist = require('./checklist')

async function main(event) {
  const { pathParameters, requestContext } = event
  log.info({ requestContext }, 'Delete request received')
  const userId = requestContext.identity.cognitoIdentityId
  const { id: listId } = pathParameters

  return await createResponse(checklist.remove({ listId, userId }))
}

module.exports = { main }
