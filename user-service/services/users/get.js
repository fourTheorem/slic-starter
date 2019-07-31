'use strict'

const { middify } = require('slic-tools/middy-util')

const user = process.env.IS_OFFLINE
  ? require('./user-offline')
  : require('./user')

const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')

async function main(event) {
  const { pathParameters } = processEvent(event)
  const { id: userId } = pathParameters
  return createResponse(user.get({ userId }))
}

module.exports = middify({ main })
