'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const updateHandler = proxyquire('../../../services/checklists/update', {
  './checklist.js': {
    update: params => {
      received.updateParams = params
      return received
    }
  }
})

test('update handler updates current checklist', async t => {
  const event = {
    requestContext: {
      identity: {
        cognitoIdentityId: 'testUser'
      },
      body: { name: 'checklist' }
    }
  }

  const result = await updateHandler.main(event)

  t.end()
})
