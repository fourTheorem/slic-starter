import { createResponse, processEvent } from 'slic-tools';

import { remove } from './checklist.js';

export async function main(event) {
  const { pathParameters, userId } = processEvent(event);
  const { id: listId } = pathParameters;

  return createResponse(remove({ listId, userId }));
}
