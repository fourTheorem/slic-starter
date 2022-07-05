import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../../fixtures.js';

let listEntriesParams = {};
let listEntriesReturnVal = {};
await td.replaceEsm('../../../../services/checklists/entries/entries.js', {
  listEntries: (params) => {
    listEntriesParams = { ...params };
    return Promise.resolve(listEntriesReturnVal);
  },
});

const listEntriesHandler = await import(
  '../../../../services/checklists/entries/list.js'
);

t.beforeEach(async () => {
  listEntriesParams = {};
  listEntriesReturnVal = {};
});

t.test(
  'list entry handler lists entries contained in a checklists',
  async (t) => {
    const listId = uuid();
    const event = {
      requestContext: userRequestContext,
      pathParameters: {
        id: listId,
      },
    };
    listEntriesReturnVal = {
      entries: { [uuid()]: { title: 'test-title', value: 'test-val' } },
    };

    const result = await listEntriesHandler.main(event);

    t.equal(listEntriesParams.listId, listId);
    t.equal(listEntriesParams.userId, userId);
    t.equal(result.statusCode, 200);
    t.same(JSON.parse(result.body), listEntriesReturnVal);
  }
);
