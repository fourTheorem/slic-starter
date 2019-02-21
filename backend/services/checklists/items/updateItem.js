'use strict'

const { createResponse } = require('../../../lib/response')
const log = require('../../../lib/log')
const item = require('./items')

async function main(event) {
  const { pathParameters, requestContext } = event

  log.info({ requestContext }, 'Get request received')
  const { id: listId, entId, value } = pathParameters

  return await createResponse(item.updateItem({ entId, value }))
}

module.exports = { main }
