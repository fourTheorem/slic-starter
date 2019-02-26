'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('./checklist')
const { processEvent } = require('../../lib/event-util')

async function main(event) {
  const { userId } = processEvent(event)
  return createResponse(checklist.list({ userId }))
}

module.exports = { main }
