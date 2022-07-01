const t = require('tap');
const { v4: uuid } = require('uuid');

const { userId, userRequestContext } = require('../../fixtures');

let getParams = {};
let getReturnVal = {};
const getHandler = t.mock('../../../services/checklists/get', {
  '../../../services/checklists/checklist.js': {
    get: (params) => {
      getParams = { ...params };
      return Promise.resolve(getReturnVal);
    },
  },
});

t.beforeEach(async () => {
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
