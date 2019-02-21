'use strict'

const { createResponse } = require('../../../lib/response')
const log = require('../../../lib/log')
const items = require('./items')

async function main(event) {
  const { pathParameters, requestContext } = event
  log.info({ requestContext }, 'List Request Received')
  const { id: listId } = pathParameters

  return await createResponse(items.listItems({ listId }))
}

module.exports = { main }
