'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('./checklist')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { body, userId } = processEvent(event)
  const { name, description } = body
  return createResponse(checklist.create({ userId, name, description }), {
    successCode: 201
  })
}

module.exports = { main }
