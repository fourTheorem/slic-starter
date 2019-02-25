'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const payload = { title: 'item1', value: '' }
const addItemHandler = proxyquire(
  '../../../../services/checklists/items/addItem.js',
  {
    '../items/items.js': {
      addItem: params => {
        received.addItemParams = params
        return received
      }
    }
  }
)

test('add item handler creates items for checklists', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    },
    body: JSON.stringify(payload),

    pathParameters: {
      id: '1234'
    }
  }

  const result = await addItemHandler.main(event)

  t.equal(
    received.addItemParams.userId,
    event.requestContext.identity.cognitoIdentityId
  )
  t.equal(received.addItemParams.listId, event.pathParameters.id)
  t.equal(received.addItemParams.title, payload.title)
  t.equal(received.addItemParams.value, payload.value)
  t.equal(result.statusCode, 201)
  t.end()
})
