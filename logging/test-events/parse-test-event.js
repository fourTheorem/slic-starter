'use strict'

const { gunzipSync } = require('zlib')

const event = require('./log-event.json')

const gzipped = Buffer.from(event.awslogs.data, 'base64')
const unzipped = gunzipSync(gzipped)
const obj = JSON.parse(unzipped.toString('utf8'))
const formatted = JSON.stringify(obj, null, '  ')
console.log(formatted)
