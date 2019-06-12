'use strict'
const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId, userRequestContext } = require('../../fixtures')

const received = {}
const testLists = [
  {
    listId: 1,
    name: 'List One',
    description: 'List One Description',
    category: 'In Progress'
  },
  {
    listId: 2,
    name: 'List Two',
    description: 'List Two Description',
    category: 'TODO'
  }
]

const listHandler = proxyquire('../../../services/checklists/list', {
  './checklist.js': {
    list: params => {
      received.listParams = params
      return testLists
    }
  }
})

test('list handler executes checklist service', async t => {
  const event = {
    requestContext: userRequestContext
  }

  const result = await listHandler.main(event)
  t.equal(received.listParams.userId, userId)
  t.equal(result.statusCode, 200)
  t.same(JSON.parse(result.body), testLists)

  t.end()
})
