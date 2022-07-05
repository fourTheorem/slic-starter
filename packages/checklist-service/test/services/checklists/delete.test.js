import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../fixtures.js';

let deleteParams = {};
await td.replaceEsm('../../../services/checklists/checklist.js', {
  remove: (params) => {
    deleteParams = { ...params };
    return Promise.resolve();
  },
});

const deleteHandler = await import('../../../services/checklists/delete.js');

t.beforeEach(async () => {
  td.reset();
  deleteParams = {};
});

t.test('list handler executes checklist service', async (t) => {
  const listId = uuid();
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId,
    },
  };

  const result = await deleteHandler.main(event);

  t.equal(deleteParams.listId, listId);
  t.equal(deleteParams.userId, userId);
  t.equal(result.statusCode, 200);
  t.same(JSON.parse(result.body), {});
});
