import {
  CloudWatchEventsClient,
  PutEventsCommand,
} from '@aws-sdk/client-cloudwatch-events';
import AWSXRay from 'aws-xray-sdk-core';

import { log } from './log.js';
import { name as serviceName } from './service-info.js';

const cwEvents = new CloudWatchEventsClient({
  endpoint: process.env.EVENTS_ENDPOINT_URL,
});

/* istanbul ignore next */
const cwEventsClient = process.env.IS_OFFLINE
  ? cwEvents
  : AWSXRay.captureAWSv3Client(cwEvents); // TODO Re-enable X-Ray always

export async function dispatchEvent(type, detail) {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(detail),
        DetailType: type,
        Source: serviceName,
      },
    ],
  };
  log.info({ params }, 'Sending EventBridge event');
  await cwEventsClient.send(new PutEventsCommand(params));
}
