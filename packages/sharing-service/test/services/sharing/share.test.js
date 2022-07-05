import t from 'tap';
import { v4 as uuid } from 'uuid';
import * as td from 'testdouble';

import { invitation } from '../../../lib/invitation.js';

const userId = uuid();
const codeSecret = uuid();
const { createCode } = invitation(codeSecret);
const testUser = {
  userId,
  email: `userId+${uuid()}@example.com`,
};
const listName = `Test List - ${uuid()}`;

let sendEmailArgs = [];
let getUserArgs = [];
let dispatchEventArgs = [];
await td.replaceEsm('slic-tools', {
  ...(await import('slic-tools')),
  sendEmail: (...args) => {
    sendEmailArgs.push(...args);
    return Promise.resolve();
  },
  getUser: (...args) => {
    getUserArgs.push(...args);
    return Promise.resolve(testUser);
  },
  dispatchEvent: (...args) => {
    dispatchEventArgs.push(...args);
    return Promise.resolve();
  },
});

const shareService = await import('../../../services/sharing/share.js');

t.beforeEach(async () => {
  td.reset();
  sendEmailArgs = [];
  getUserArgs = [];
  dispatchEventArgs = [];
});

t.test('An email is sent when a list is shared', async (t) => {
  const payload = {
    ...testUser,
    listId: uuid(),
    listName,
  };

  await shareService.create(payload, codeSecret);

  t.match(sendEmailArgs, [
    {
      to: testUser.email,
      subject: new RegExp(`.*${payload.listName}$`),
      body: new RegExp(`.*${payload.listName}*`, 'm'),
    },
  ]);
});

t.test('An event is dispatched when a code is confirmed', async (t) => {
  const params = {
    listName,
    userId,
    email: `invitee+${uuid()}@example.com`,
    listId: uuid(),
  };
  const code = createCode(params);

  const collaboratorUserId = uuid();
  await shareService.confirm({ code, userId: collaboratorUserId }, codeSecret);
  t.same(dispatchEventArgs, [
    'COLLABORATOR_ACCEPTED_EVENT',
    {
      listId: params.listId,
      sharedListOwner: userId,
      userId: collaboratorUserId,
    },
  ]);
});

t.test('An error is thrown when an invalid code is provided', async (t) => {
  const invalidCode = `some-random-code-${uuid()}`;

  await t.rejects(
    shareService.confirm({ code: invalidCode, userId: uuid() }, codeSecret),
    { statusCode: 400 }
  );
});
