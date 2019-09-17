'use strict'

const { getUser } = require('slic-tools/user-util')
const { sendEmail } = require('slic-tools/email-util')
const { dispatchEvent } = require('slic-tools/event-dispatcher')
const log = require('slic-tools/log')

const invitation = require('../../lib/invitation')

const stage = process.env.SLIC_STAGE
const nsDomain = process.env.SLIC_NS_DOMAIN

async function create({ email, listId, listName, userId }) {
  const baseLink = `${process.env.FRONTEND_URL}/invitation/`

  const { email: sharerEmail } = await getUser(userId)
  log.info({ email, userId, listId })

  const { createCode } = invitation(process.env.CODE_SECRET)
  const code = createCode({ listId, listName, userId, email })
  log.info({ code })
  const fullLink = baseLink + code

  const message = {
    to: email,
    subject: `Invitation to join ${listName}`,
    body: `${sharerEmail} has invited you to join ${listName} on SLIC Lists
To accept this invitation, click on the following link.
${fullLink}

Many thanks,
SLIC Lists
`
  }
  log.debug({ message }, 'Dispatching email')
  await sendEmail(message)
}

async function confirm({ code, userId }) {
  const { parseCode } = invitation(process.env.CODE_SECRET)
  let parsedCode
  try {
    parsedCode = parseCode(code)
  } catch (err) {
    const error = new Error('Invalid code')
    error.statusCode = 400
    throw error
  }
  await dispatchEvent('COLLABORATOR_ACCEPTED_EVENT', {
    listId: parsedCode.listId,
    sharedListOwner: parsedCode.userId,
    userId
  })
}

module.exports = {
  create,
  confirm
}
