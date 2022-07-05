import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import {
  userId,
  userRequestContext,
  commonEventProps,
} from '../../fixtures.js';

const payload = {
  email: 'email@example.com',
  listId: uuid(),
  listName: 'First Checklist',
};

let createArgs = [];
await td.replaceEsm('../../../services/sharing/share.js', {
  create: (...args) => {
    createArgs.push(...args);
    return Promise.resolve();
  },
});

const { handler } = await import('../../../services/sharing/create.js');

t.beforeEach(async () => {
  td.reset();
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

  const res = await handler(event, ctx);
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
