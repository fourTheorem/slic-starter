'use strict'

const { createResponse } = require('slic-tools/response.js')
const checklist = require('./checklist')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { body, userId } = processEvent(event)
  const { name, description } = body
  return createResponse(checklist.create({ userId, name, description }), {
    successCode: 201
  })
}
module.exports = { main }
