'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('checklist')

async function main(event, context, callback) {
  const { name, tasks } = JSON.parse(event.body)
  const userId = event.requestContext.identity.cognitoIdentityId
  const { id: listId } = event.pathParameters

  return await createResponse(checklist.update({ listId, userId, name, tasks }))
}

module.exports = { main }
