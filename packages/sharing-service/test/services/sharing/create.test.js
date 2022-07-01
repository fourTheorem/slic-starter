const t = require('tap');
const { v4: uuid } = require('uuid');

const {
  userId,
  userRequestContext,
  commonEventProps,
} = require('../../fixtures');

const payload = {
  email: 'email@example.com',
  listId: uuid(),
  listName: 'First Checklist',
};

let createArgs = [];
const createHandler = t.mock('../../../services/sharing/create', {
  '../../../services/sharing/share': {
    create: (...args) => {
      createArgs.push(...args);
      return Promise.resolve();
    },
  },
});

t.beforeEach(async () => {
  createArgs = [];
});

t.test('A checklist can be shared with another user', async (t) => {
  const event = {
    ...commonEventProps,
    requestContext: userRequestContext,
    body: JSON.stringify(payload),
  };
  const ctx = {
    codeSecret: uuid(),
    userServiceUrl: 'http://user-service.com',
    frontendUrl: 'http://frontend.com',
  };

  const res = await createHandler.main(event, ctx);
  t.same(createArgs, [
    {
      email: payload.email,
      listId: payload.listId,
      listName: payload.listName,
      userId,
    },
    ctx.codeSecret,
    ctx.userServiceUrl,
    ctx.frontendUrl,
  ]);

  t.match(res, { statusCode: 201 });
});
