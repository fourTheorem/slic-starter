import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';
import { dynamoDocClient } from 'slic-tools';
import { createMetricsLogger, Unit } from 'aws-embedded-metrics';

const TableName = process.env.CHECKLIST_TABLE_NAME;
const dynamo = dynamoDocClient();

export async function addEntry({ userId, listId, title, value }) {
  const entId = uuid();
  const params = {
    TableName,
    Key: {
      userId,
      listId,
    },
    UpdateExpression: 'SET #ent.#entId = :entry',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId,
    },
    ExpressionAttributeValues: {
      ':entry': {
        title,
        value,
      },
    },
    ReturnValues: 'ALL_NEW',
  };

  const {
    Attributes: { entries },
  } = await dynamo.send(new UpdateCommand(params));

  const metrics = createMetricsLogger();
  metrics.putMetric('NumEntries', Object.keys(entries).length, Unit.Count);
  metrics.putMetric('EntryWords', title.trim().split(/s/).length, Unit.Count);
  await metrics.flush();

  return {
    entId,
    title,
    value,
  };
}

export async function updateEntry({ userId, listId, entId, title, value }) {
  const params = {
    TableName,
    Key: {
      userId,
      listId,
    },
    UpdateExpression:
      'SET #ent.#entId.#title = :title, #ent.#entId.#value = :value',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId,
      '#title': 'title',
      '#value': 'value',
    },
    ExpressionAttributeValues: {
      ':title': title,
      ':value': value,
    },
    ReturnValues: 'NONE',
  };

  await dynamo.send(new UpdateCommand(params));

  const metrics = createMetricsLogger();
  metrics.putMetric('EntryWords', title.trim().split(/s/).length, Unit.Count);
  await metrics.flush();

  return {
    entId,
    title,
    value,
  };
}

export async function listEntries({ listId, userId }) {
  const params = {
    TableName,
    Key: { userId, listId },
    ProjectionExpression: 'entries',
  };

  const {
    Item: { entries },
  } = await dynamo.send(new GetCommand(params));
  return entries;
}

export async function deleteEntry({ userId, listId, entId }) {
  const params = {
    TableName,
    Key: {
      userId,
      listId,
    },
    UpdateExpression: 'REMOVE #ent.#entId',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId,
    },
  };

  await dynamo.send(new UpdateCommand(params));
}
