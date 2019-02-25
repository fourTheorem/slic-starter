'use strict'
const { createResponse } = require('../../../lib/response')
const items = require('./items')

async function main(event) {
  const { body, pathParameters, requestContext } = event
  const { title, value } = JSON.parse(body)
  const userId = requestContext.identity.cognitoIdentityId
  const { id: listId } = pathParameters

  return await createResponse(items.addItem({ userId, listId, title, value }), {
    successCode: 201
  })
}

module.exports = { main }
