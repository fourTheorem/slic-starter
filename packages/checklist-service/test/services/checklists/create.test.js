const t = require('tap');
const { v4: uuid } = require('uuid');

const { userId, userRequestContext } = require('../../fixtures');

let createParams = {};
let createReturnVal = {};
const createHandler = t.mock('../../../services/checklists/create', {
  '../../../services/checklists/checklist.js': {
    create: (params) => {
      createParams = { ...params };
      return Promise.resolve(createReturnVal);
    },
  },
});

t.beforeEach(async () => {
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
