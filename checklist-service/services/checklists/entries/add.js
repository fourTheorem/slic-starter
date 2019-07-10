'use strict'

const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')
const entries = require('./entries')

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event)
  const { title, value } = body
  const { id: listId } = pathParameters

  return createResponse(entries.addEntry({ userId, listId, title, value }), {
    successCode: 201
  })
}

module.exports = { main }
