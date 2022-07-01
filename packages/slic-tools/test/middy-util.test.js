const { test } = require('tap');
const { middify } = require('../middy-util');

test('middify handles empty export', (t) => {
  middify({});
  t.end();
});

test('middify handles multiple exports', (t) => {
  middify(
    {
      handler: () => {},
    },
    {}
  );
  t.end();
});
