'use strict'

const share = require('./share')
const { processEvent } = require('slic-tools/event-util')
const { middify } = require('slic-tools/middy-util')

async function main(event) {
  const { pathParameters, body, userId } = processEvent(event)
  const { listId } = pathParameters
  const { email, listName } = body

  const result = await share.create({ email, listId, listName, userId })
  return {
    statusCode: 201,
    body: result
  }
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      CODE_SECRET: 'CODE_SECRET'
    }
  }
)
