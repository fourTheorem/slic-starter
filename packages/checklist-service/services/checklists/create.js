import { createResponse, processEvent } from 'slic-tools';

import { create } from './checklist.js';

export async function main(event) {
  const { body, userId } = processEvent(event);
  const { name, description } = body;

  return createResponse(create({ userId, name, description }), {
    successCode: 201,
  });
}
