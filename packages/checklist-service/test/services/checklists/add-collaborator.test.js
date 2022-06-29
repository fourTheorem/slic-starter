const t = require('tap')

const { userId } = require('../../fixtures')

let addCollaboratorParams = {}

const addCollaboratorHandler = t.mock('../../../services/checklists/add-collaborator.js', {
  '../../../services/checklists/checklist.js': {
    addCollaborator: params => {
      addCollaboratorParams = { ...params }
      return Promise.resolve(addCollaboratorParams)
    }
  }
}
)

t.beforeEach(async () => {
  addCollaboratorParams = {}
})

t.test('addCollaborator adds collaborators to existing lists', async t => {
  const collaboratorUserId = 'collaborator123'
  const event = {
    detail: { userId, listId: 'list123', collaboratorUserId }
  }

  await addCollaboratorHandler.main(event)
  t.equal(addCollaboratorParams.userId, userId)
  t.equal(addCollaboratorParams.collaboratorUserId, collaboratorUserId)
})
