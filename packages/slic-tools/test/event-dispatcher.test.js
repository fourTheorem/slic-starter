import {
  CloudWatchEventsClient,
  PutEventsCommand,
} from '@aws-sdk/client-cloudwatch-events';
import { mockClient } from 'aws-sdk-client-mock';
import t from 'tap';

import { dispatchEvent } from '../event-dispatcher.js';

const cwEventsMock = mockClient(CloudWatchEventsClient);

t.beforeEach(async () => {
  cwEventsMock.reset();
  cwEventsMock.on(PutEventsCommand).resolves({});
});

t.test('dispatchEvent dispatches a CloudWatch custom event', async (t) => {
  const type = 'LIST_CREATED_EVENT';
  const testList = {
    name: 'Test List',
    userId: 'user123',
  };

  const expectedInput = {
    Entries: [
      {
        Detail: JSON.stringify(testList),
        DetailType: type,
        Source: 'default-service',
      },
    ],
  };

  await dispatchEvent(type, testList);

  t.equal(cwEventsMock.send.callCount, 1);
  t.same(cwEventsMock.send.firstCall.args[0].input, expectedInput);
});
