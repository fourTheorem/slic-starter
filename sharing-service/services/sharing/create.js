'use strict'

const { createResponse } = require('../../../slic-tools/response')
const share = require('./share')
const { processEvent } = require('../../../slic-tools/event-util')

async function main(event) {
  const {body} = processEvent(event)
  const {emailAddress, userId, listId} = body
  return createResponse(share.create({ emailAddress, userId, listId }), {
    successCode: 201
  })
}

module.exports = { main }
