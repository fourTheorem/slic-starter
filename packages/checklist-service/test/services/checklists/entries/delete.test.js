import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../../fixtures.js';

let deleteEntryParams = {};
await td.replaceEsm('../../../../services/checklists/entries/entries.js', {
  deleteEntry: (params) => {
    deleteEntryParams = { ...params };
    return Promise.resolve();
  },
});

const deleteEntryHandler = await import(
  '../../../../services/checklists/entries/delete.js'
);

t.beforeEach(async () => {
  td.reset();
  deleteEntryParams = {};
});

t.test('delete entry handler removes entries from checklists', async (t) => {
  const listId = uuid();
  const entryId = uuid();
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId,
      entId: entryId,
    },
  };

  const result = await deleteEntryHandler.main(event);

  t.equal(deleteEntryParams.userId, userId);
  t.equal(deleteEntryParams.listId, listId);
  t.equal(deleteEntryParams.entId, entryId);
  t.equal(result.statusCode, 200);
  t.same(JSON.parse(result.body), {});
});
