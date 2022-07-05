import { createResponse, processEvent } from 'slic-tools';

import { get } from './checklist.js';

export async function main(event) {
  const { pathParameters, userId } = processEvent(event);
  const { id: listId } = pathParameters;

  return createResponse(get({ listId, userId }));
}
