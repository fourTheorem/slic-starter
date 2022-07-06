import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TableName = 'checklists';

const userId = 'TODO1';
const listId = 'TODO1';

const updatedAt = Date.now();
const entries = [1, 2, 3];

console.log('Executing update');

const result = await docClient.send(
  new UpdateCommand({
    TableName,
    Key: { userId, listId },
    UpdateExpression: 'SET entries= :entries, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':entries': entries,
      ':updatedAt': updatedAt,
    },
  })
);

console.log('DONE', result);
