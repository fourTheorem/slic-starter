'use strict'
const crypto = require('crypto')

const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')
const { createShareAcceptedEvent } = require('slic-tools/event-dispatcher')
const invitation = require('../../lib/invitation')
const { middify } = require('../../lib/middy-util')

async function main(event) {
  const { parseCode } = invitation(process.env.CODE_SECRET)
  const { body } = processEvent(event)
  const { code } = body

  const parsedCode = parseCode(code)

  const { listId, userId, email } = parsedCode

  await createResponse(createShareAcceptedEvent(listId, userId, email), {
    successCode: 201
  })
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      CODE_SECRET: 'CODE_SECRET'
    }
  }
)
