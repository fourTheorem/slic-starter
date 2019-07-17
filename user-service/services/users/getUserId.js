'use strict'

const user = require('./user')
const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')

async function main(event) {
  const { pathParameters } = processEvent(event)
  const { id: email } = pathParameters

  return createResponse(user.getUserIdByEmail(email))
}

module.exports = { main }
