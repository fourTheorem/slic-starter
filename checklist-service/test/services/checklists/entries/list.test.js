'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userRequestContext } = require('../../../fixtures')

const received = {}
const listEntriesHandler = proxyquire(
  '../../../../services/checklists/entries/list',
  {
    './entries': {
      listEntries: params => {
        received.listEntriesParams = params
        return received
      }
    }
  }
)

test('list entry handler lists entries contained in a checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234'
    }
  }

  const result = await listEntriesHandler.main(event)

  t.equal(received.listEntriesParams.listId, event.pathParameters.id)
  t.equal(result.statusCode, 200)

  t.end()
})
