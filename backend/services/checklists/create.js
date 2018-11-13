'use strict'

const { createResponse } = require('../../lib/response')
const log = require('../../lib/log')
const checklist = require('./checklist')

async function main(event, context, callback) {
  const { body, requestContext } = event
  log.info({ body, requestContext }, 'Create request received')
  const { name, tasks } = JSON.parse(body)
  const userId = requestContext.identity.cognitoIdentityId

  return await createResponse(checklist.create({ userId, name, tasks }))
}

module.exports = { main }
