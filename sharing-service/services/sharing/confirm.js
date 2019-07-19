'use strict'

const { processEvent } = require('slic-tools/event-util')
const { createResponse } = require('slic-tools/response')
const { dispatchEvent } = require('slic-tools/event-dispatcher')
const invitation = require('../../lib/invitation')
const { middify } = require('../../lib/middy-util')

async function main(event) {
  const { parseCode } = invitation(process.env.CODE_SECRET)
  const { body, userId } = processEvent(event)
  const { code } = body

  const parsedCode = parseCode(code)

  await createResponse(
    dispatchEvent('COLLABORATOR_ACCEPTED_EVENT', {
      ...parsedCode,
      collaboratorUserId: userId
    })
  )
}

module.exports = middify(
  { main },
  {
    ssmParameters: {
      CODE_SECRET: 'CODE_SECRET'
    }
  }
)
