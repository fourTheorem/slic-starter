import { processEvent, createResponse } from 'slic-tools';

import { deleteEntry } from './entries.js';

export async function main(event) {
  const { pathParameters, userId } = processEvent(event);
  const { id: listId, entId } = pathParameters;

  return createResponse(deleteEntry({ userId, listId, entId }));
}
