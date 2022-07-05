import { createResponse, processEvent } from 'slic-tools';

import { update } from './checklist.js';

export async function main(event) {
  const { body, pathParameters, userId } = processEvent(event);
  const { name, description } = body;
  const { id: listId } = pathParameters;

  return createResponse(update({ listId, userId, name, description }));
}
