import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT_URL,
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TableName = 'checklists';

/*
testaccount1@example.com UserId: mock-auth-dGVzdGFjY291bnQxQGV4YW1wbGUuY29t
testaccount2@example.com mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t
*/
console.log('Querying records');
const userId = 'mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t'; // testaccount2
const { Items: lists } = await docClient.send(
  new QueryCommand({
    TableName,
    ProjectionExpression:
      'listId, #nm, #description, createdAt, sharedListOwner, userId',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeNames: {
      '#nm': 'name',
      '#description': 'description',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  })
);

console.log({ lists });
const sharedListKeys = lists
  .filter((list) => list.sharedListOwner)
  .map((list) => ({ userId: list.sharedListOwner, listId: list.listId }));

// Next, find the actual records for shared lists with name, description and createdAt values
if (sharedListKeys.length > 0) {
  const { Responses } = await docClient.send(
    new BatchGetCommand({
      RequestItems: {
        [TableName]: {
          Keys: sharedListKeys,
          ProjectionExpression: 'listId, #nm, #description, createdAt, userId',
          ExpressionAttributeNames: {
            '#nm': 'name',
            '#description': 'description',
          },
        },
      },
    })
  );
  const sharedLists = Responses[TableName];
  // Merge values from actual records into shared list records
  console.log('sharedlists***', { sharedLists });
  for (const sharedList of sharedLists) {
    console.log('INDIVIDUAL_SHARED_LIST', sharedList);
    const record = lists.find((list) => list.listId === sharedList.listId);
    console.log('record', record);
    Object.assign(record, {
      name: sharedList.name,
      description: sharedList.description,
      createdAt: sharedList.createdAt,
    });
  }
}
console.log('Finished querying records', lists);
