'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const deleteItemHandler = proxyquire(
  '../../../../services/checklists/items/deleteItem.js',
  {
    '../items/items.js': {
      deleteItem: params => {
        received.deleteItemParams = params
        return received
      }
    }
  }
)

test('delete item handler removes items from checklists', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    },

    pathParameters: {
      id: '1234',
      endId: '1'
    }
  }

  const result = await deleteItemHandler.main(event)

  t.equal(
    received.deleteItemParams.userId,
    event.requestContext.identity.cognitoIdentityId
  )
  t.equal(received.deleteItemParams.listId, event.pathParameters.id)
  t.equal(received.deleteItemParams.entId, event.pathParameters.entId)

  t.end()
})
