'use strict'

const { createResponse } = require('slic-tools/response')
const checklist = require('./checklist')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event)
  const { name, description } = body
  const { id: listId } = pathParameters
  return createResponse(checklist.update({ listId, userId, name, description }))
}

module.exports = { main }
