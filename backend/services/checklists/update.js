'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('./checklist')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event)
  const { name } = body
  const { id: listId } = pathParameters
  return createResponse(checklist.update({ listId, userId, name }))
}

module.exports = { main }
