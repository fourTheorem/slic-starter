import { processEvent, createResponse } from 'slic-tools';

import { addEntry } from './entries.js';

export async function main(event) {
  const { body, pathParameters, userId } = processEvent(event);
  const { title, value } = body;
  const { id: listId } = pathParameters;

  return createResponse(addEntry({ userId, listId, title, value }), {
    successCode: 201,
  });
}
