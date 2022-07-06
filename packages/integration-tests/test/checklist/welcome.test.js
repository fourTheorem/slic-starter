import t from 'tap';
import { retrieveEmail } from 'test-common';

import { httpClient } from '../../lib/http-client.js';
import { getUser } from '../../lib/user-util.js';

const testList = {
  name: 'New Checklist',
  description: 'New Checklist description',
};

const subject = 'Your SLIC List';
let user;
t.beforeEach(async (t) => {
  user = await getUser();
});

t.test(
  'When a checklist is created, an email is sent to the user',
  async (t) => {
    const { email } = user;
    const response = await httpClient.post('', testList);
    const { status, data } = response;
    t.equal(status, 201);
    t.ok(data.createdAt);
    t.ok(data.listId);

    const message = await retrieveEmail(email, subject);

    t.equal(
      message.text.body,
      `Congratulations! You created the list ${testList.name}`
    );
  }
);
