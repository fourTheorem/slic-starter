'use strict'
const proxyquire = require('proxyquire')

const { test } = require('tap')

const received = {}
const payload = { name: 'hello' }
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
    body: JSON.stringify(payload)
  }

  const result = await createHandler.main(event)

  t.equal(
    received.createParams.userId,
    event.requestContext.identity.cognitoIdentityId
  )
  t.equal(received.createParams.name, payload.name)
  t.equal(result.statusCode, 201)

  t.end()
})
