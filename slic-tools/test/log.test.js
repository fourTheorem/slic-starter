'use strict'

const { test } = require('tap')

test('log at debug level', t => {
  process.env.DEBUG = 'true'
  delete require.cache[require.resolve('../log')]
  require('../log').debug('debug test')
  t.end()
})

test('log at info level', t => {
  delete process.env.DEBUG
  delete require.cache[require.resolve('../log')]
  require('../log').debug('info test')
  t.end()
})
