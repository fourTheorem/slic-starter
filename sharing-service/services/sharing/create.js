'use strict'

const { createResponse } = require('slic-tools/response')
const share = require('./share')
const { processEvent } = require('slic-tools/event-util')

const { middify } = require('../../lib/middy-util')

async function main(event) {
  const { body, userId } = processEvent(event)
  const { email, listId, listName } = body

  return createResponse(share.create({ email, listId, listName, userId }), {
    successCode: 201
  })
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      USER_SERVICE_URL: 'UserServiceUrl',
      CODE_SECRET: 'CODE_SECRET'
    }
  }
)
