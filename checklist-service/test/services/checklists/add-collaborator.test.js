'use strict'

const proxyquire = require('proxyquire')
const { test } = require('tap')

const { userId } = require('../../fixtures')

const received = {}

const addCollaboratorHandler = proxyquire(
  '../../../services/checklists/add-collaborator.js',
  {
    './checklist': {
      addCollaborator: params => {
        received.addCollaboratorParams = params
        return received
      }
    }
  }
)

test('addCollaborator adds collaborators to existing lists', async t => {
  const collaboratorUserId = 'collaborator123'
  const event = {
    detail: { userId, listId: 'list123', collaboratorUserId }
  }

  await addCollaboratorHandler.main(event)
  t.equal(received.addCollaboratorParams.userId, userId)
  t.equal(received.addCollaboratorParams.collaboratorUserId, collaboratorUserId)

  t.end()
})
