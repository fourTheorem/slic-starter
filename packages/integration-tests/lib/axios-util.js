import pick from 'lodash/pick.js';

const suppressedProperties = new Set(['nativeProtocols']);

export function toneAxiosError(error) {
  if (!process.env.VERBOSE_AXIOS_ERRORS) {
    const summarized = {};

    // Remove verbose properties from request options
    if (error.request) {
      summarized.request = pick(error.request, [
        'headers',
        'method',
        'path',
        '_header',
      ]);
      /* eslint-disable no-underscore-dangle, no-param-reassign */
      if (error.request._options) {
        const requestOptions = { ...error.request._options };
        for (const property of Object.keys(error.request._options)) {
          if (suppressedProperties.has(property)) {
            delete requestOptions[property];
          }
        }
        summarized.request = {
          _options: requestOptions,
        };
      }
    }

    if (error.response) {
      summarized.response = pick(error.response, [
        'headers',
        'status',
        'statusText',
        'config.url',
        'data',
      ]);
    }

    error._full_request = error.request;
    error._full_response = error.response;
    /* eslint-enable no-underscore-dangle, no-param-reassign */

    Object.assign(error, summarized);

    // Make large objects non-enumerable to remove excessive verbosity from logs
    for (const property of ['config', '_full_request', '_full_response'])
      Object.defineProperty(error, property, { enumerable: false });
  }
  return error;
}
