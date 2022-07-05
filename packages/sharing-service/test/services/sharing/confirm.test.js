import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import {
  userId,
  userRequestContext,
  commonEventProps,
} from '../../fixtures.js';
import { invitation } from '../../../lib/invitation.js';

const codeSecret = uuid();
const { createCode } = invitation(codeSecret);
const params = {
  listName: 'A Test List',
  listId: uuid(),
  userId,
  email: 'email@example.com',
};

let confirmArgs = [];
await td.replaceEsm('../../../services/sharing/share.js', {
  confirm: (...args) => {
    confirmArgs.push(...args);
    return Promise.resolve();
  },
});

const { handler } = await import('../../../services/sharing/confirm.js');

t.beforeEach(async () => {
  td.reset();
  confirmArgs = [];
});

t.test('An invitation can be confirmed', async (t) => {
  const code = createCode(params);
  const pathParameters = {
    code,
  };
  const event = {
    ...commonEventProps,
    requestContext: userRequestContext,
    pathParameters,
  };
  const ctx = { codeSecret };

  const res = await handler(event, ctx);

  t.same(confirmArgs, [{ code, userId }, codeSecret]);
  t.match(res, { statusCode: 204 });
});
