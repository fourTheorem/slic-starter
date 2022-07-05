import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';
import { dispatchEvent, dynamoDocClient } from 'slic-tools';

const TableName = process.env.CHECKLIST_TABLE_NAME;
const dynamo = dynamoDocClient();

export async function create({ userId, name, description }) {
  const Item = {
    userId,
    name,
    description,
    entries: {},
    listId: uuid(),
    createdAt: Date.now(),
  };

  await dynamo.send(
    new PutCommand({
      TableName,
      Item,
    })
  );

  await dispatchEvent('LIST_CREATED_EVENT', Item);

  return Item;
}

export async function update({ listId, userId, name, description }) {
  const params = {
    TableName,
    Key: { userId, listId },
    UpdateExpression:
      'SET #name = :name, updatedAt = :updatedAt, #description = :description',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#description': 'description',
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':updatedAt': Date.now(),
      ':description': description,
    },
    ReturnValues: 'ALL_NEW',
  };

  const { Attributes } = await dynamo.send(new UpdateCommand(params));

  return Attributes;
}

export async function remove({ listId, userId }) {
  await dynamo.send(
    new DeleteCommand({
      TableName,
      Key: { userId, listId },
    })
  );
}

export async function get({ listId, userId }) {
  const params = {
    TableName,
    Key: { userId, listId },
    ProjectionExpression: 'listId, #nm, #description, #createdAt',
    ExpressionAttributeNames: {
      '#nm': 'name',
      '#description': 'description',
      '#createdAt': 'createdAt',
    },
  };

  const { Item } = await dynamo.send(new GetCommand(params));

  return Item;
}

export async function list({ userId }) {
  // Find all lists accessible by the user, including
  // shared lists which have sharedListOwner set but no values
  // for name, description or createdAt
  const { Items: lists } = await dynamo.send(
    new QueryCommand({
      TableName,
      ProjectionExpression:
        '#listId, #name, #description, #createdAt, #sharedListOwner, #userId',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: {
        '#listId': 'listId',
        '#name': 'name',
        '#description': 'description',
        '#createdAt': 'createdAt',
        '#sharedListOwner': 'sharedListOwner',
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );

  const sharedListKeys = lists
    .filter((l) => l.sharedListOwner)
    .map((l) => ({ userId: l.sharedListOwner, listId: l.listId }));

  // Next, find the actual records for shared lists with name, description and createdAt values
  if (sharedListKeys.length > 0) {
    const params = {
      RequestItems: {
        [TableName]: {
          Keys: sharedListKeys,
          ProjectionExpression:
            '#listId, #name, #description, #createdAt, #sharedListOwner, #userId',
          ExpressionAttributeNames: {
            '#listId': 'listId',
            '#name': 'name',
            '#description': 'description',
            '#createdAt': 'createdAt',
            '#sharedListOwner': 'sharedListOwner',
            '#userId': 'userId',
          },
        },
      },
    };

    const {
      Responses: { [TableName]: sharedLists },
    } = await dynamo.send(new BatchGetCommand(params));

    // Merge values from shared list records into user list records
    for (const sharedList of sharedLists) {
      const sharedListIndex = lists.findIndex(
        (l) => l.listId === sharedList.listId
      );
      lists[sharedListIndex] = {
        ...lists[sharedListIndex],
        name: sharedList.name,
        description: sharedList.description,
        createdAt: sharedList.createdAt,
      };
    }
  }

  return lists;
}

export async function addCollaborator({ sharedListOwner, listId, userId }) {
  const Item = {
    sharedListOwner,
    listId,
    userId,
  };

  await dynamo.send(
    new PutCommand({
      TableName,
      Item,
    })
  );

  return Item;
}
