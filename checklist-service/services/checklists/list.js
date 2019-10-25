'use strict'

const { createResponse } = require('slic-tools/response')
const checklist = require('./checklist')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  debugger
  const { userId } = processEvent(event)
  return createResponse(checklist.list({ userId }))
}

module.exports = { main }
