const t = require('tap');

const { userId, userRequestContext } = require('../../fixtures');

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

const listHandler = t.mock('../../../services/checklists/list', {
  '../../../services/checklists/checklist.js': {
    list: (params) => {
      listParams = { ...params };
      return Promise.resolve(testLists);
    },
  },
});

t.beforeEach(async () => {
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
