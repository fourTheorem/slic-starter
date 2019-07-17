'use strict'
const log = require('slic-tools/log')
const { createResponse } = require('slic-tools/response')
const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  const { body } = processEvent(event)
  const { email, listId } = body

  return createResponse(share.create({ email, listId }), {
    successCode: 201
  })
}

module.exports = { main }
