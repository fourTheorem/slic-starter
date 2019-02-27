'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../../fixtures')

const received = {}
const payload = { title: 'entry1', value: '' }
const addEntryHandler = proxyquire(
  '../../../../services/checklists/entries/add',
  {
    './entries': {
      addEntry: params => {
        received.addEntryParams = params
        return received
      }
    }
  }
)

test('add entry handler creates entries for checklists', async t => {
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload),

    pathParameters: {
      id: '1234'
    }
  }

  const result = await addEntryHandler.main(event)

  t.equal(received.addEntryParams.userId, userId)
  t.equal(received.addEntryParams.listId, event.pathParameters.id)
  t.equal(received.addEntryParams.title, payload.title)
  t.equal(received.addEntryParams.value, payload.value)
  t.equal(result.statusCode, 201)
  t.end()
})
