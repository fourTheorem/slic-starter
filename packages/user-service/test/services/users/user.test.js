import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import t from 'tap';
import { v4 as uuid } from 'uuid';

import { get as getUser } from '../../../services/users/user.js';

process.env.USER_POOL_ID = `User_pool${uuid()}`;
const testEmail = `email+${uuid()}@example.com`;

const cognitoMock = mockClient(CognitoIdentityProviderClient);

t.beforeEach(async () => {
  await cognitoMock.reset();
  cognitoMock
    .on(AdminGetUserCommand)
    .resolves({ UserAttributes: [{ Name: 'email', Value: testEmail }] });
});

t.test('user service retrieves cognito user information', async (t) => {
  const userId = uuid();

  const response = await getUser({
    userId,
  });
  t.match(response, {
    email: testEmail,
  });

  // Run again to test pre-cached user ID
  const response2 = await getUser({
    userId,
  });
  t.match(response2, {
    email: testEmail,
  });

  t.equal(cognitoMock.send.callCount, 2);
  t.same(cognitoMock.send.firstCall.args[0].input, {
    UserPoolId: process.env.USER_POOL_ID,
    Username: userId,
  });
});
