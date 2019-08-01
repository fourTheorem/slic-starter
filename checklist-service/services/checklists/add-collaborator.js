'use strict'

const { createResponse } = require('slic-tools/response.js')
const checklist = require('./checklist')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  return checklist.addCollaborator(event.detail)
}

async function httpMain(event) {
  const { body, pathParameters, userId: sharedListOwner } = processEvent(event)
  const { userId } = body
  const { listId } = pathParameters

  return checklist.addCollaborator({
    userId,
    listId,
    sharedListOwner
  })

  return createResponse(checklist.create({ userId, name, description }), {
    successCode: 201
  })
}

module.exports = { main }
