import { mockClient } from 'aws-sdk-client-mock';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import t from 'tap';

import * as emailHandler from '../../../services/email/email-handler.js';

const sesMock = mockClient(SESv2Client);

t.beforeEach(async () => {
  await sesMock.reset();
  sesMock.on(SendEmailCommand).resolves({});
});

t.test('email sends an email', async (t) => {
  const emailFromAddress = 'noreply@example.com';
  const event = {
    Records: [
      {
        body: '{"to":"example@example.com" , "subject":"SLIC List", "body": "hello"}',
      },
    ],
  };

  await emailHandler.sendEmail(event, { emailFromAddress });

  const expectedArgs = {
    Destination: {
      ToAddresses: ['example@example.com'],
    },
    Content: {
      Simple: {
        Body: {
          Text: {
            Data: 'hello',
            Charset: 'UTF-8', // eslint-disable-line unicorn/text-encoding-identifier-case
          },
        },
        Subject: {
          Data: 'SLIC List',
          Charset: 'UTF-8', // eslint-disable-line unicorn/text-encoding-identifier-case
        },
      },
    },
    FromEmailAddress: emailFromAddress,
  };

  t.equal(sesMock.send.callCount, 1);
  t.same(sesMock.send.firstCall.args[0].input, expectedArgs);
});
