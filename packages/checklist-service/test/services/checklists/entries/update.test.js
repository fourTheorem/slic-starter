import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../../fixtures.js';

let updateEntryParams = {};
let updateEntryReturnVal = {};
await td.replaceEsm('../../../../services/checklists/entries/entries.js', {
  updateEntry: (params) => {
    updateEntryParams = { ...params };
    return Promise.resolve(updateEntryReturnVal);
  },
});

const updateEntryHandler = await import(
  '../../../../services/checklists/entries/update.js'
);

t.beforeEach(async () => {
  td.reset();
  updateEntryParams = {};
  updateEntryReturnVal = {};
});

t.test(
  'update entry handler allows updating of checklist entries',
  async (t) => {
    const listId = uuid();
    const entId = uuid();
    const event = {
      requestContext: userRequestContext,
      pathParameters: {
        id: listId,
        entId,
      },
      body: JSON.stringify({
        title: 'new value',
        value: 'complete',
      }),
    };
    updateEntryReturnVal = { entId, title: 'new value', value: 'complete' };

    const result = await updateEntryHandler.main(event);

    t.same(updateEntryParams, {
      listId,
      entId,
      title: 'new value',
      value: 'complete',
      userId,
    });
    t.equal(result.statusCode, 200);
    t.same(JSON.parse(result.body), {
      entId,
      title: 'new value',
      value: 'complete',
    });
  }
);
