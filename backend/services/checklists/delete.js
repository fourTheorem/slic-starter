'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('checklist')

async function main(event, context, callback) {
  const userId = event.requestContext.identity.cognitoIdentityId
  const { id: listId } = event.pathParameters

  return await createResponse(checklist.remove({ listId, userId }))
}

module.exports = { main }
