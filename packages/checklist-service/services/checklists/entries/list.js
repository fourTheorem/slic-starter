import { processEvent, createResponse } from 'slic-tools';

import { listEntries } from './entries.js';

export async function main(event) {
  const { pathParameters, userId } = processEvent(event);
  const { id: listId } = pathParameters;

  return createResponse(listEntries({ listId, userId }));
}
