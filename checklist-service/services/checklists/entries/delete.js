'use strict'

const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')
const entries = require('./entries')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId, entId } = pathParameters
  return createResponse(entries.deleteEntry({ userId, listId, entId }))
}

module.exports = { main }
