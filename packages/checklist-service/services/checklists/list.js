import { createResponse, processEvent } from 'slic-tools';

import { list } from './checklist.js';

export async function main(event) {
  const { userId } = processEvent(event);

  return createResponse(list({ userId }));
}
