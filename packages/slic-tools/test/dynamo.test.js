import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import t from 'tap';
import { v4 as uuid } from 'uuid';

t.test('A DynamoDB client is provided', async (t) => {
  const { dynamoDocClient } = await import('../dynamo.js');
  const client = dynamoDocClient();
  t.type(client, DynamoDBDocumentClient);
});

t.test(
  'A standard DynamoDB client is provided when the port is specified but is offline env var not set',
  async (t) => {
    process.env.DYNAMODB_LOCAL_PORT = '9000';
    // eslint-disable-next-line import/no-unresolved
    const { dynamoDocClient } = await import(`../dynamo.js?update=${uuid()}`); // to force a new version of the module
    const client = dynamoDocClient();

    t.type(client, DynamoDBDocumentClient);
    t.equal(client.config.isCustomEndpoint, false);
  }
);

t.test('A local DynamoDB client is provided when offline', async (t) => {
  process.env.IS_OFFLINE = 'true';
  // eslint-disable-next-line import/no-unresolved
  const { dynamoDocClient } = await import(`../dynamo.js?update=${uuid()}`); // to force a new version of the module

  const client = dynamoDocClient();
  t.type(client, DynamoDBDocumentClient);

  const clientRegion = await client.config.region();
  t.equal(clientRegion, 'localhost');
  t.equal(client.config.isCustomEndpoint, true);
});
