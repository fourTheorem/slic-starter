'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('./checklist')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { pathParameters, userId } = processEvent(event)
  const { id: listId } = pathParameters
  return createResponse(checklist.get({ listId, userId }))
}

module.exports = { main }
