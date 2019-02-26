'use strict'

const { createResponse } = require('../../../lib/response')
const items = require('./items')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId, entId } = pathParameters

  return createResponse(items.deleteItem({ userId, listId, entId }))
}

module.exports = { main }
