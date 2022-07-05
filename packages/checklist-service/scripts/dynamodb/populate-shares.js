import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT_URL,
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/*
testaccount1@example.com UserId: mock-auth-dGVzdGFjY291bnQxQGV4YW1wbGUuY29t

listId: ,"result":,"msg":"Result received","v":1}

testaccount2@example.com mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t

"result":,"msg":"Result received","v":1}
*/

const records = [
  {
    userId: 'mock-auth-dGVzdGFjY291bnQxQGV4YW1wbGUuY29t',
    name: 'List A owned by testaccount1@example.com',
    entries: {},
    listId: 'f0f3bcf9-61e7-47d8-99aa-8d9bdcc8b80f',
    createdAt: 1_565_082_900_907,
  },
  {
    userId: 'mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t',
    name: 'List B owned by testaccount2@example.com',
    entries: {},
    listId: 'bfb92cb6-c6b5-4ef4-bc5f-c0178c0c0874',
    createdAt: 1_565_082_960_158,
  },
  {
    userId: 'mock-auth-dGVzdGFjY291bnQyQGV4YW1wbGUuY29t',
    listId: 'f0f3bcf9-61e7-47d8-99aa-8d9bdcc8b80f',
    sharedListOwner: 'mock-auth-dGVzdGFjY291bnQxQGV4YW1wbGUuY29t',
  },
];

console.log('Querying records');
await Promise.all(
  records.map((record) =>
    docClient.send(
      new PutCommand({
        TableName: 'checklists',
        Item: record,
      })
    )
  )
);
console.log('Finished querying records');
