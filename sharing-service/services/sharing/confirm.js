'use strict'

const { processEvent } = require('slic-tools/event-util')
const { dispatchEvent } = require('slic-tools/event-dispatcher')
const invitation = require('../../lib/invitation')
const { middify } = require('slic-tools/middy-util')
const log = require('slic-tools/log')

async function main(event) {
  const { parseCode } = invitation(process.env.CODE_SECRET)
  const { body, userId } = processEvent(event)
  const { code } = body

  const parsedCode = parseCode(code)

  await dispatchEvent('COLLABORATOR_ACCEPTED_EVENT', {
    ...parsedCode,
    collaboratorUserId: userId
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
