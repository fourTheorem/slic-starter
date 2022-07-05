import { test } from 'tap';

test('log at debug level', async (t) => {
  process.env.DEBUG = 'true';
  const { log } = await import('../log.js');
  log.debug('debug test');
});

test('log at info level', async (t) => {
  delete process.env.DEBUG;
  const { log } = await import('../log.js');
  log.debug('info test');
});
