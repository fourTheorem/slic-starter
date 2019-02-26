'use strict'

const { processEvent } = require('../../../lib/event-util')
const { createResponse } = require('../../../lib/response')
const entries = require('./entries')

// TODO - Fix security problem - you can update someone else's list
async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId, entId, value } = pathParameters
  return createResponse(entries.updateEntry({ entId, value }))
}

module.exports = { main }
