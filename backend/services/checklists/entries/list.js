'use strict'

const { processEvent } = require('../../../lib/event-util')
const { createResponse } = require('../../../lib/response')
const entries = require('./entries')

async function main(event) {
  const { pathParameters } = processEvent(event)
  const { id: listId } = pathParameters
  return createResponse(entries.listEntries({ listId }))
}

module.exports = { main }
