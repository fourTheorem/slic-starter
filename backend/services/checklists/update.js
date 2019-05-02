'se strict'

const { createResponse } = require('../../lib/response')
const checklist = require('./checklist')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event)
  const { name, description } = body
  const { id: listId } = pathParameters
  return createResponse(checklist.update({ listId, userId, name, description }))
}

module.exports = { main }
