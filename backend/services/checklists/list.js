'use strict'

const { createResponse } = require('../../lib/response')
const checklist = require('checklist')

async function main(event, context, callback) {
  const userId = event.requestContext.identity.cognitoIdentityId
  return await createResponse(checklist.list({ userId }))
}

module.exports = { main }
