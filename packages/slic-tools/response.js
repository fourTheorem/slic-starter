import { log } from './log.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export async function createResponse(promise, options) {
  const successCode = (options && options.successCode) || 200;
  try {
    const result = await promise;
    log.info({ result }, 'Result received');

    return {
      statusCode: successCode,
      body: JSON.stringify(result || {}),
      headers,
    };
  } catch (error) {
    log.error({ error }, 'Request implementation failed');
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false }),
      headers,
    };
  }
}
