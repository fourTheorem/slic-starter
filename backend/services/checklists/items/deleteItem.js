'use strict'

const { createResponse } = require('../../../lib/response')
const log = require('../../../lib/log')
const item = require('./items')

async function main(event, context, callback) {
  const { pathParameters, requestContext } = event
  log.info({ requestContext }, 'Delete Request Received')
  const userId = requestContext.identity.cognitoIdentityId
  const { id: listId, entId: entId } = pathParameters

  return await createResponse(item.deleteItem({ userId, listId, entId }))
}

module.exports = { main }
