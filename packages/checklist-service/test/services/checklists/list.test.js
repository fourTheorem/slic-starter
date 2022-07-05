import t from 'tap';
import * as td from 'testdouble';

import { userId, userRequestContext } from '../../fixtures.js';

let listParams = {};
const testLists = [
  {
    listId: 1,
    name: 'List One',
    description: 'List One Description',
    category: 'In Progress',
  },
  {
    listId: 2,
    name: 'List Two',
    description: 'List Two Description',
    category: 'TODO',
  },
];

await td.replaceEsm('../../../services/checklists/checklist.js', {
  list: (params) => {
    listParams = { ...params };
    return Promise.resolve(testLists);
  },
});

const listHandler = await import('../../../services/checklists/list.js');

t.beforeEach(async () => {
  td.reset();
  listParams = {};
});

t.test('list handler executes checklist service', async (t) => {
  const event = {
    requestContext: userRequestContext,
  };

  const result = await listHandler.main(event);
  t.equal(listParams.userId, userId);
  t.equal(result.statusCode, 200);
  t.same(JSON.parse(result.body), testLists);
});
