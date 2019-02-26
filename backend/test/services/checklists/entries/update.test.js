'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userRequestContext } = require('../../../fixtures')

const received = {}

const updateEntryHandler = proxyquire(
  '../../../../services/checklists/entries/update',
  {
    './entries': {
      updateEntry: params => {
        received.updateEntryParams = params
        return received
      }
    }
  }
)

test('update entry handler allows updating of checklist entries', async t => {
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: '1234',
      entId: '1a42',
      value: 'complete'
    }
  }

  const result = await updateEntryHandler.main(event)

  t.equal(received.updateEntryParams.entId, event.pathParameters.entId)
  t.equal(received.updateEntryParams.value, event.pathParameters.value)
  t.equal(result.statusCode, 200)

  t.end()
})
