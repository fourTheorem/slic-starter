'use strict'

const { createResponse } = require('slic-tools/response.js')
const log = require('slic-tools/log')
const checklist = require('./checklist')
const { processEvent } = require('slic-tools/event-util')

async function main(event) {
  return checklist.addCollaborator(event.detail)
}
module.exports = { main }
