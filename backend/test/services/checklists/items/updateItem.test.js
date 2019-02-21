'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const updateItemHandler = proxyquire(
  '../../../../services/checklists/items/updateItem.js',
  {
    '../items/items.js': {
      updateItem: params => {
        received.updateItemParams = params
        return received
      }
    }
  }
)

test('update item handler allows updating of checklist items', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    },

    pathParameters: {
      id: '1234',
      entId: '1a42',
      value: 'complete'
    }
  }

  const result = await updateItemHandler.main(event)

  t.equal(received.updateItemParams.entId, event.pathParameters.entId)
  t.equal(received.updateItemParams.value, event.pathParameters.value)

  t.end()
})
