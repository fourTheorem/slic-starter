'use strict'

const checklist = require('./checklist')

/**
 * Handle an "Add collaborator" CloudWatch Event
 */
async function main(event) {
  return checklist.addCollaborator(event.detail)
}
module.exports = { main }
