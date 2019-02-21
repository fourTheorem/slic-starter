'use strict'

const { createResponse } = require('../../lib/response')
const log = require('../../lib/log')
const checklist = require('./checklist')

async function main(event) {
  const { body, pathParameters, requestContext } = event
  log.info({ body, pathParameters, requestContext }, 'Update request received')
  const { name } = JSON.parse(body)
  const userId = requestContext.identity.cognitoIdentityId
  const { id: listId } = pathParameters

  return await createResponse(checklist.update({ listId, userId, name }))
}

module.exports = { main }
