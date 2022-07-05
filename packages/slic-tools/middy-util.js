import middy from '@middy/core';
import httpCors from '@middy/http-cors';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import ssm from '@middy/ssm';
import inputOutputLogger from '@middy/input-output-logger';

import { log } from './log.js';

export function middify(handler, options = {}) {
  const innerHandler = middy(handler).use(
    inputOutputLogger({
      logger: (request) => {
        log.debug({ request }, 'request');
      },
    })
  );

  if (options.isHttpHandler) {
    innerHandler.use([
      httpEventNormalizer(),
      httpJsonBodyParser(),
      httpCors(),
      httpErrorHandler(),
    ]);
  }

  /* istanbul ignore next */
  if (options.ssmParameters && process.env.SLIC_STAGE !== 'test') {
    innerHandler.use(
      ssm({
        fetchData: options.ssmParameters,
        awsClientOptions: {
          endpoint: process.env.SSM_ENDPOINT_URL,
        },
        setToContext: true,
      })
    );
  }

  return innerHandler;
}
