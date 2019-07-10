'use strict'

const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')
const entries = require('./entries')

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event)
  const { id: listId, entId } = pathParameters
  const { title, value } = body
  return createResponse(
    entries.updateEntry({ listId, userId, entId, title, value })
  )
}

module.exports = { main }
