import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import t from 'tap';
import * as td from 'testdouble';

process.env.CHECKLIST_TABLE_NAME = 'checklists';

const dynamoMock = mockClient(DynamoDBDocumentClient);

const userId = 'ownerA';
const list1 = {
  userId: 'ownerA',
  listId: 'list1',
  name: 'List One',
  description: 'List One Description',
  entries: {},
};
const testLists = {
  ownerA: [
    list1,
    {
      userId: 'ownerA',
      listId: 'list2',
      name: 'List Two',
      description: 'List Two Description',
      entries: {},
    },
  ],
  ownerB: [
    {
      userId: 'ownerB',
      listId: 'list3',
      name: 'List Three',
      description: 'List three Description',
      entries: {},
    },
    {
      userId: 'ownerB',
      listId: 'list1',
      sharedListOwner: 'ownerA',
    },
  ],
};

let dispatchEventArgs = [];

await td.replaceEsm('slic-tools', {
  ...(await import('slic-tools')),
  dispatchEvent: (...args) => {
    dispatchEventArgs.push(...args);
    return Promise.resolve();
  },
});

const checklist = await import('../../../services/checklists/checklist.js');

t.beforeEach(async () => {
  td.reset();
  await dynamoMock.reset();
  dynamoMock.resolves({});
  dispatchEventArgs = [];
});

t.test('create puts a dynamodb item', async (t) => {
  const listName = 'Test List';
  const listDescription = 'Test Description';

  const response = await checklist.create({
    userId,
    name: listName,
    description: listDescription,
  });

  t.equal(dynamoMock.send.callCount, 1);
  t.equal(
    dynamoMock.send.firstCall.args[0].input.TableName,
    process.env.CHECKLIST_TABLE_NAME
  );
  t.equal(dynamoMock.send.firstCall.args[0].input.Item.userId, userId);
  t.equal(dynamoMock.send.firstCall.args[0].input.Item.name, listName);
  t.ok(dynamoMock.send.firstCall.args[0].input.Item.createdAt);
  t.ok(dynamoMock.send.firstCall.args[0].input.Item.listId);
  t.same(dynamoMock.send.firstCall.args[0].input.Item.entries, {});
  t.equal(
    dynamoMock.send.firstCall.args[0].input.Item.description,
    listDescription
  );

  t.same(dispatchEventArgs, [
    'LIST_CREATED_EVENT',
    { ...dynamoMock.send.firstCall.args[0].input.Item },
  ]);

  t.match(response, {
    userId,
    name: listName,
    description: listDescription,
  });
});

t.test('update function updates current checklists', async (t) => {
  const list = {
    listId: '1234',
    userId,
    name: 'New title',
    description: 'New Description',
  };

  await checklist.update(list);

  t.equal(dynamoMock.send.callCount, 1);
  t.equal(
    dynamoMock.send.firstCall.args[0].input.TableName,
    process.env.CHECKLIST_TABLE_NAME
  );
  t.hasProps(
    dynamoMock.send.firstCall.args[0].input.ExpressionAttributeValues,
    [':name', ':updatedAt', ':description']
  );
  t.same(dynamoMock.send.firstCall.args[0].input.Key, {
    userId: list.userId,
    listId: list.listId,
  });
});

t.test(
  'update function updates current checklists when name not specified',
  async (t) => {
    const list = {
      listId: '1234',
      userId,
    };

    await checklist.update(list);

    t.equal(dynamoMock.send.callCount, 1);
    t.equal(
      dynamoMock.send.firstCall.args[0].input.TableName,
      process.env.CHECKLIST_TABLE_NAME
    );
    t.match(dynamoMock.send.firstCall.args[0].input.ExpressionAttributeValues, {
      ':name': undefined,
      ':description': undefined,
    });
    t.ok(
      dynamoMock.send.firstCall.args[0].input.ExpressionAttributeValues[
        ':updatedAt'
      ]
    );
  }
);

t.test('Get a checklist based on a listId and userId', async (t) => {
  const list = {
    listId: list1.listId,
    userId: list1.userId,
  };

  dynamoMock.on(GetCommand).resolvesOnce({
    Item: list1,
  });

  const response = await checklist.get(list);

  t.same(response, list1);
  t.equal(dynamoMock.send.callCount, 1);
  t.equal(
    dynamoMock.send.firstCall.args[0].input.TableName,
    process.env.CHECKLIST_TABLE_NAME
  );
  t.same(dynamoMock.send.firstCall.args[0].input.Key, {
    userId: list.userId,
    listId: list.listId,
  });
});

t.test('remove a checklist', async (t) => {
  const list = {
    listId: '1234',
    userId,
  };

  await checklist.remove(list);

  t.equal(dynamoMock.send.callCount, 1);
  t.equal(
    dynamoMock.send.firstCall.args[0].input.TableName,
    process.env.CHECKLIST_TABLE_NAME
  );
  t.same(dynamoMock.send.firstCall.args[0].input.Key, {
    userId: list.userId,
    listId: list.listId,
  });
});

t.test('list all checklists for user', async (t) => {
  dynamoMock.on(QueryCommand).resolvesOnce({
    Items: testLists[userId],
  });

  const response = await checklist.list({ userId });

  t.same(response, testLists[userId]);
  t.equal(dynamoMock.send.callCount, 1);
  t.equal(
    dynamoMock.send.firstCall.args[0].input.TableName,
    process.env.CHECKLIST_TABLE_NAME
  );
  t.equal(
    dynamoMock.send.firstCall.args[0].input.ExpressionAttributeValues[
      ':userId'
    ],
    userId
  );
});

t.test('list all checklists including shared lists', async (t) => {
  const userIdB = 'ownerB';

  dynamoMock.on(QueryCommand).resolvesOnce({
    Items: testLists[userIdB],
  });

  dynamoMock.on(BatchGetCommand).resolvesOnce({
    Responses: {
      [process.env.CHECKLIST_TABLE_NAME]: [list1],
    },
  });

  const response = await checklist.list({ userId: userIdB });

  t.equal(dynamoMock.send.callCount, 2);
  t.match(response, testLists.ownerB);

  const shared = response.find((share) => share.sharedListOwner);

  const originalList = testLists.ownerB.find(
    (list) => list.listId === shared.listId
  );

  t.equal(shared.name, originalList.name);
  t.equal(shared.description, originalList.description);
});

t.test('add a collaborator', async (t) => {
  const list = {
    sharedListOwner: 'list-owner',
    listId: 'list-shared',
    userId,
  };

  await checklist.addCollaborator(list);

  t.equal(dynamoMock.send.callCount, 1);
  t.equal(
    dynamoMock.send.firstCall.args[0].input.TableName,
    process.env.CHECKLIST_TABLE_NAME
  );
  t.same(dynamoMock.send.firstCall.args[0].input.Item, {
    userId: list.userId,
    listId: list.listId,
    sharedListOwner: list.sharedListOwner,
  });
});
