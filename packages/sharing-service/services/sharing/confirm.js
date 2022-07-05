import { middify, processEvent } from 'slic-tools';

import { confirm } from './share.js';

async function innerHandler(event, { codeSecret }) {
  const { pathParameters, userId } = processEvent(event); // TODO - Remove processEvent
  const { code } = pathParameters;

  await confirm({ code, userId }, codeSecret);

  return {
    statusCode: 204,
  };
}

export const handler = middify(innerHandler, {
  ssmParameters: {
    codeSecret: `/${process.env.SLIC_STAGE}/sharing-service/code-secret`,
  },
  isHttpHandler: true,
});
