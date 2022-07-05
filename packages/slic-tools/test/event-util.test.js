import { test } from 'tap';
import { v4 as uuid } from 'uuid';

import { processEvent } from '../event-util.js';

test('userId is extracted from the cognito lambda-proxy-mapped authorizer claims', async (t) => {
  const testUserId = uuid();
  const event = {
    requestContext: {
      authorizer: {
        claims: {
          'cognito:username': testUserId,
        },
      },
    },
  };

  const { userId } = processEvent(event);
  t.equal(userId, testUserId);
});

test('body is parsed from the JSON body', async (t) => {
  const testUserId = uuid();
  const testBody = { a: 1, b: 2 };
  const event = {
    body: JSON.stringify(testBody),
    requestContext: {
      authorizer: {
        claims: {
          'cognito:username': testUserId,
        },
      },
    },
  };

  const { body, userId } = processEvent(event);
  t.equal(userId, testUserId);
  t.same(body, testBody);
});
