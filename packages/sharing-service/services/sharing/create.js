import { middify, processEvent } from 'slic-tools';

import { create } from './share.js';

async function innerHandler(event, context) {
  const { body, userId } = processEvent(event);
  const { email, listId, listName } = body;

  await create(
    { email, listId, listName, userId },
    context.codeSecret,
    context.userServiceUrl,
    context.frontendUrl
  );
  return {
    statusCode: 201,
  };
}

export const handler = middify(innerHandler, {
  ssmParameters: {
    codeSecret: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`,
    userServiceUrl: `/${process.env.SLIC_STAGE}/user-service/url`,
    frontendUrl: `/${process.env.SLIC_STAGE}/frontend/url`,
  },
  isHttpHandler: true,
});
