'use strict'

const { createResponse } = require('../../lib/response')
const log = require('../../lib/log')
const checklist = require('./checklist')

async function main(event, context, callback) {
  const { requestContext } = event
  log.info({ requestContext }, 'List request received')
  const userId = requestContext.identity.cognitoIdentityId
  return await createResponse(checklist.list({ userId }))
}

module.exports = { main }
