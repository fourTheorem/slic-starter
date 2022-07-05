import middy from '@middy/core';
import httpCors from '@middy/http-cors';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import ssm from '@middy/ssm';
import inputOutputLogger from '@middy/input-output-logger';

import { log } from './log.js';

export function middify(exports, options = {}) {
  const result = {};
  Object.keys(exports).forEach((key) => {
    const handler = middy(exports[key]).use(
      inputOutputLogger({
        logger: (request) => {
          log.debug({ request }, 'request');
        },
      })
    );

    if (options.isHttpHandler) {
      handler.use([
        httpEventNormalizer(),
        httpJsonBodyParser(),
        httpCors(),
        httpErrorHandler(),
      ]);
    }

    /* istanbul ignore next */
    if (options.ssmParameters && process.env.SLIC_STAGE !== 'test') {
      handler.use(
        ssm({
          fetchData: options.ssmParameters,
          awsClientOptions: {
            endpoint: process.env.SSM_ENDPOINT_URL,
          },
          setToContext: true,
        })
      );
    }
    result[key] = handler;
  });
  return result;
}
