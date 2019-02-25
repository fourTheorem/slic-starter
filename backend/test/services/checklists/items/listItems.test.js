'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const listItemsHandler = proxyquire(
  '../../../../services/checklists/items/listItems.js',
  {
    '../items/items.js': {
      listItems: params => {
        received.listItemsParams = params
        return received
      }
    }
  }
)

test('list item handler lists items contained in a checklists', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    },

    pathParameters: {
      id: '1234'
    }
  }

  const result = await listItemsHandler.main(event)

  t.equal(received.listItemsParams.listId, event.pathParameters.id)
  t.equal(result.statusCode, 200)

  t.end()
})
