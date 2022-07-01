const t = require('tap');
const { v4: uuid } = require('uuid');

let addCollaboratorParams = {};
let addCollaboratorReturnVal = {};
const addCollaboratorHandler = t.mock(
  '../../../services/checklists/add-collaborator.js',
  {
    '../../../services/checklists/checklist.js': {
      addCollaborator: (params) => {
        addCollaboratorParams = { ...params };
        return Promise.resolve(addCollaboratorReturnVal);
      },
    },
  }
);

t.beforeEach(async () => {
  addCollaboratorParams = {};
  addCollaboratorReturnVal = {};
});

t.test('addCollaborator adds collaborators to existing lists', async (t) => {
  const userId = uuid();
  const listId = uuid();
  const collaboratorUserId = uuid();
  const event = {
    detail: { userId, listId, collaboratorUserId },
  };

  addCollaboratorReturnVal = {
    listId,
    userId,
    sharedListOwner: collaboratorUserId,
  };

  const res = await addCollaboratorHandler.main(event);
  t.equal(addCollaboratorParams.userId, userId);
  t.equal(addCollaboratorParams.collaboratorUserId, collaboratorUserId);
  t.same(res, addCollaboratorReturnVal);
});
