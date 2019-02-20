'use strict'

const { createResponse } = require('../../lib/response')
const log = require('../../lib/log')
const checklist = require('./checklist')

async function main(event) {
  const { body, requestContext } = event
  log.info({ body, requestContext }, 'Create request received')
  const { name } = JSON.parse(body)
  const userId = requestContext.identity.cognitoIdentityId

  return await createResponse(checklist.create({ userId, name }))
}

module.exports = { main }
