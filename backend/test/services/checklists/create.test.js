'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const createHandler = proxyquire('../../../services/checklists/create', {
  './checklist.js': {
    create: params => {
      received.createParams = params
      return received
    }
  }
})

test('create handler creates new checklists', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      }
    },
    body: { name: 'first list' }
  }

  const result = await createHandler.main(event)

  t.end()
})
