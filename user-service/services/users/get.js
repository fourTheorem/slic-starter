'use strict'

const user = require('./user')
const { processEvent } = require('../../lib/event-util')
const { createResponse } = require('../../lib/response')

async function main(event) {
  const { pathParameters } = processEvent(event)
  const { id: userId } = pathParameters
  return createResponse(user.get({ userId }))
}

module.exports = { main }
