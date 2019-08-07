'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')
const uuid = require('uuid')

const { userId, userRequestContext } = require('../../fixtures')

const testCollaborators = [uuid.v4(), uuid.v4()]

const received = {}

const listCollaboratorsHandler = proxyquire(
  '../../../services/checklists/list-collaborators',
  {
    './checklist': {
      listCollaborators: params => {
        received.listCollaboratorsParams = params
        return Promise.resolve(testCollaborators)
      }
    }
  }
)

test('listCollaborator lists collaborators to existing lists', async t => {
  const listId = uuid.v4()

  const event = {
    requestContext: userRequestContext,
    pathParameters: { listId }
  }

  const result = await listCollaboratorsHandler.main(event)
  t.equal(received.listCollaboratorsParams.userId, userId)
  t.same(result, testCollaborators)

  t.end()
})
