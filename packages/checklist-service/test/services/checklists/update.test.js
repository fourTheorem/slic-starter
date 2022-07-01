const t = require('tap');
const { v4: uuid } = require('uuid');

const { userId, userRequestContext } = require('../../fixtures');

let updateParams = {};
let updateReturnVal = {};
const updateHandler = t.mock('../../../services/checklists/update', {
  '../../../services/checklists/checklist.js': {
    update: (params) => {
      updateParams = { ...params };
      return Promise.resolve(updateReturnVal);
    },
  },
});

t.beforeEach(async () => {
  updateParams = {};
  updateReturnVal = {};
});

t.test('update handler updates current checklist', async (t) => {
  const listId = uuid();
  const payload = {
    name: 'checklist name',
    description: 'Checklist Description',
  };
  const event = {
    requestContext: userRequestContext,
    pathParameters: {
      id: listId,
    },
    body: JSON.stringify(payload),
  };

  updateReturnVal = { att1: 'val1', att2: 'val2' };

  const result = await updateHandler.main(event);

  t.equal(result.statusCode, 200);
  t.same(JSON.parse(result.body), updateReturnVal);
  t.equal(updateParams.userId, userId);
  t.equal(updateParams.name, payload.name);
  t.equal(updateParams.description, payload.description);
  t.equal(updateParams.listId, listId);
});
