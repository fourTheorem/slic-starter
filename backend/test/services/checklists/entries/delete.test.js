'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../../fixtures')

const received = {}

const deleteEntryHandler = proxyquire(
  '../../../../services/checklists/entries/delete',
  {
    './entries': {
      deleteEntry: params => {
        received.deleteEntryParams = params
        return received
      }
    }
  }
)

test('delete entry handler removes entries from checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234',
      endId: '1'
    }
  }

  const result = await deleteEntryHandler.main(event)

  t.equal(received.deleteEntryParams.userId, userId)
  t.equal(received.deleteEntryParams.listId, event.pathParameters.id)
  t.equal(received.deleteEntryParams.entId, event.pathParameters.entId)
  t.equal(result.statusCode, 200)

  t.end()
})
