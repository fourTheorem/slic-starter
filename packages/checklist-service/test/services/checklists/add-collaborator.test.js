import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

let addCollaboratorParams = {};
let addCollaboratorReturnVal = {};

await td.replaceEsm('../../../services/checklists/checklist.js', {
  addCollaborator: (params) => {
    addCollaboratorParams = { ...params };
    return Promise.resolve(addCollaboratorReturnVal);
  },
});

const addCollaboratorHandler = await import(
  '../../../services/checklists/add-collaborator.js'
);

t.beforeEach(async () => {
  td.reset();
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
