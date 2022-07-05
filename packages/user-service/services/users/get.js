import { createResponse, processEvent, middify } from 'slic-tools';

const user = process.env.IS_OFFLINE
  ? await import('./user-offline.js')
  : await import('./user.js');

async function innerHandler(event) {
  const { pathParameters } = processEvent(event);
  const { id: userId } = pathParameters;

  return createResponse(user.get({ userId }));
}

export const handler = middify(innerHandler, { isHttpHandler: true });
