import { processEvent, createResponse } from 'slic-tools';

import { updateEntry } from './entries.js';

export async function main(event) {
  const { body, pathParameters, userId } = processEvent(event);
  const { id: listId, entId } = pathParameters;
  const { title, value } = body;

  return createResponse(updateEntry({ listId, userId, entId, title, value }));
}
