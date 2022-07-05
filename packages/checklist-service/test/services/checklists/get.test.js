import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../fixtures.js';

let getParams = {};
let getReturnVal = {};
await td.replaceEsm('../../../services/checklists/checklist.js', {
  get: (params) => {
    getParams = { ...params };
    return Promise.resolve(getReturnVal);
  },
});

const getHandler = await import('../../../services/checklists/get.js');

t.beforeEach(async () => {
  td.reset();
  getParams = {};
  getReturnVal = {};
});

t.test('get handler gets checklists', async (t) => {
  const listId = uuid();
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId,
    },
  };

  getReturnVal = { someListItem: {} };

  const result = await getHandler.main(event);

  t.equal(result.statusCode, 200);
  t.same(JSON.parse(result.body), getReturnVal);
  t.equal(getParams.listId, listId);
  t.equal(getParams.userId, userId);
});
