const t = require('tap');
const { v4: uuid } = require('uuid');

const { userId, userRequestContext } = require('../../../fixtures');

let updateEntryParams = {};
let updateEntryReturnVal = {};
const updateEntryHandler = t.mock(
  '../../../../services/checklists/entries/update',
  {
    '../../../../services/checklists/entries/entries.js': {
      updateEntry: (params) => {
        updateEntryParams = { ...params };
        return Promise.resolve(updateEntryReturnVal);
      },
    },
  }
);

t.beforeEach(async () => {
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
