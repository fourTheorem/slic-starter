'use strict'

const { test } = require('tap')
const { middify } = require('../middy-util')

test('middify handles empty export', t => {
  middify({})
  t.end()
})
