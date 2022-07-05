import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../../fixtures.js';

let addEntryParams = {};
let addEntryReturnVal = {};
await td.replaceEsm('../../../../services/checklists/entries/entries.js', {
  addEntry: (params) => {
    addEntryParams = { ...params };
    return Promise.resolve(addEntryReturnVal);
  },
});

const addEntryHandler = await import(
  '../../../../services/checklists/entries/add.js'
);

t.beforeEach(async () => {
  td.reset();
  addEntryParams = {};
  addEntryReturnVal = {};
});

t.test('add entry handler creates entries for checklists', async (t) => {
  const listId = uuid();
  const payload = { title: 'entry1', value: 'some-value' };
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload),

    pathParameters: {
      id: listId,
    },
  };

  addEntryReturnVal = {
    entId: uuid(),
    title: payload.title,
    value: payload.value,
  };

  const result = await addEntryHandler.main(event);

  t.equal(addEntryParams.userId, userId);
  t.equal(addEntryParams.listId, listId);
  t.equal(addEntryParams.title, payload.title);
  t.equal(addEntryParams.value, payload.value);
  t.equal(result.statusCode, 201);
  t.same(JSON.parse(result.body), addEntryReturnVal);
});
