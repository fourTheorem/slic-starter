import pino from 'pino';

import { name } from './service-info.js';

export const log = pino({
  name,
  level:
    process.env.DEBUG ||
    process.env.IS_OFFLINE ||
    process.env.SLIC_STAGE === 'dev'
      ? 'debug'
      : 'info',
  enabled: !(process.env.NO_LOGS === 'true'),
});
