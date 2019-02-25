'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const getHandler = proxyquire('../../../services/checklists/get', {
  './checklist.js': {
    get: params => {
      received.getParams = params
      return received
    }
  }
})

test('get handler gets checklists', async t => {
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

  const result = await getHandler.main(event)

  t.equal(received.getParams.listId, event.pathParameters.id)
  t.equal(
    received.getParams.userId,
    event.requestContext.identity.cognitoIdentityId
  )
  t.equal(result.statusCode, 200)
  t.end()
})
