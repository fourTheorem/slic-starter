const { getUser } = require('slic-tools/user-util')
const { middify } = require('slic-tools/middy-util')
const invitation = require('../../lib/invitation')
const { sendEmail } = require('slic-tools/email-util')

const { dynamoDocClient } = require('slic-tools/aws')
const log = require('slic-tools/log')

const stage = process.env.SLIC_STAGE
const nsDomain = process.env.SLIC_NS_DOMAIN

const tableName = 'checklists'
async function create({ email, listId, listName, userId }) {
  const baseLink = `https://${stage}.${nsDomain}/invitation/`

  log.info('baseLink is: ', baseLink)
  if (!nsDomain) {
    log.info('SLIC_NS_DOMAIN must be set')
  }

  const { email: sharerEmail } = await getUser(userId)
  log.info({ email, userId, listId })

  const { createCode } = invitation(process.env.CODE_SECRET)
  const code = createCode({ listId, userId, email })
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
  await sendEmail(message)
}

async function list({ listId, userId }) {
  const result = await dynamoDocClient().query({
    TableName: tableName,
    ProjectionExpression: 'collaborators',
    KeyConditionExpression: 'listId = :listId AND userId = :userId',
    ExpressionAttributeValues: {
      ':listId': listId,
      ':userId': userId
    }
  })

  log.info({ result })
  return result
}

module.exports = {
  create,
  list
}
