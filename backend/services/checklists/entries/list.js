'use strict'

const { processEvent } = require('../../../lib/event-util')
const { createResponse } = require('../../../lib/response')
const entries = require('./entries')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId } = pathParameters
  return createResponse(entries.listEntries({ listId, userId }))
}

module.exports = { main }
