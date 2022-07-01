const { test } = require('tap');
const { v4: uuid } = require('uuid');

const { processEvent } = require('../event-util');

test('userId is extracted from the cognito lambda-proxy-mapped authorizer claims', (t) => {
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
  t.end();
});

test('body is parsed from the JSON body', (t) => {
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
  t.end();
});
