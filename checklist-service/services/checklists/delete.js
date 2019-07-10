'use strict'

const { createResponse } = require('slic-tools/response')
const checklist = require('./checklist')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId } = pathParameters
  return createResponse(checklist.remove({ listId, userId }))
}

module.exports = { main }
