import signedAxios from 'aws-signed-axios';

import { log } from './log.js';

// TODO: add tests for this
/* c8 ignore start */
export async function getUser(userId, userServiceUrl) {
  const userUrl = `${userServiceUrl}${userId}`;
  try {
    const { data: result } = await signedAxios({
      method: 'GET',
      url: userUrl,
    });
    return result;
  } catch (error) {
    const response = error.response || {};
    const request = error.request || {};
    if (response.status) {
      log.error(
        {
          request: { url: request.url, headers: request.headers },
          response: {
            data: response.data,
            status: response.status,
            headers: response.headers,
          },
        },
        'Error retrieving user'
      );
    }
    throw error;
  }
}
