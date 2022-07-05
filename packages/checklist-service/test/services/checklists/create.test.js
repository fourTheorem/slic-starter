import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../fixtures.js';

let createParams = {};
let createReturnVal = {};

await td.replaceEsm('../../../services/checklists/checklist.js', {
  create: (params) => {
    createParams = { ...params };
    return Promise.resolve(createReturnVal);
  },
});
const createHandler = await import('../../../services/checklists/create.js');

t.beforeEach(async () => {
  td.reset();
  createParams = {};
  createReturnVal = {};
});

t.test('create handler creates new checklists', async (t) => {
  const payload = {
    name: 'hello',
    description: 'New Description',
  };
  const event = {
    requestContext: userRequestContext,
    body: JSON.stringify(payload),
  };

  createReturnVal = { userId, listId: uuid() };

  const result = await createHandler.main(event);

  t.equal(result.statusCode, 201);
  t.same(JSON.parse(result.body), createReturnVal);
  t.equal(createParams.userId, userId);
  t.equal(createParams.name, payload.name);
  t.equal(createParams.description, payload.description);
});
