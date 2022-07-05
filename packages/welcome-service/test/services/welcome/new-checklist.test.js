import { v4 as uuid } from 'uuid';
import t from 'tap';
import * as td from 'testdouble';

const userId = uuid();
const testUser = {
  userId,
  email: 'test-user@example.com',
};

let getUserArgs = [];
let sendEmailArgs = [];

await td.replaceEsm('slic-tools', {
  ...(await import('slic-tools')),
  getUser: (...args) => {
    getUserArgs = [...args];
    return Promise.resolve(testUser);
  },
  sendEmail: (...args) => {
    sendEmailArgs = [...args];
    return Promise.resolve();
  },
});

const { handler: checklistHandler } = await import(
  '../../../services/welcome/new-checklist.js'
);

t.beforeEach(async () => {
  td.reset();
  getUserArgs = [];
  sendEmailArgs = [];
});

t.test('handleNewChecklist sends an email message', async (t) => {
  const event = {
    detail: {
      userId,
      name: 'New Checklist',
    },
  };
  const ctx = {
    userServiceUrl: 'http://user-service.example.com',
  };

  await checklistHandler(event, ctx);

  t.same(getUserArgs, [userId, ctx.userServiceUrl]);
  t.match(sendEmailArgs, [
    {
      to: testUser.email,
      subject: 'Your SLIC List',
      body: new RegExp(`.*${event.detail.name}$`),
    },
  ]);
});
