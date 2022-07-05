const userId = 'mock-auth-87f60ea777b0d9395d5d4ad7ea4be745';
const listId = 'd7c91877-c9ab-4ec1-b18e-949034b3aee8';
const entId = '612454fd-b9e2-42a5-a493-642958835acd';
const title = 'New Title';
const value = 'YES';

const params = {
  TableName: 'checklists',
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
};

docClient.update(params, (err, data) => {
  console.log('DONE', err, data);
  if (err) ppJson(err);
  // an error occurred
  else ppJson(data); // successful response
});
