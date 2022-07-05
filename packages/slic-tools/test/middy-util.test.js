import { test } from 'tap';
import { middify } from '../middy-util.js';

test('middify handles empty export', async (t) => {
  t.ok(middify(async (event, ctx) => {}));
});
