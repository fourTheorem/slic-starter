'use strict'

const checklist = require('./checklist')

async function main(event) {
  return await checklist.addCollaborator(event.detail)
}

module.exports = { main }
