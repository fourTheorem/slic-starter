import { createResponse, processEvent, middify } from 'slic-tools';
import { get } from './user.js';

async function innerHandler(event) {
  const { pathParameters } = processEvent(event);
  const { id: userId } = pathParameters;

  let user;
  if (process.env.IS_OFFLINE) {
    const { get: getUserOffline } = await import('./user-offline.js');
    user = getUserOffline({ userId });
  } else {
    user = await get({ userId });
  }

  return createResponse(user);
}

export const handler = middify(innerHandler, { isHttpHandler: true });
