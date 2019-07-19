const { createResponse } = require('slic-tools/response')
const checklist = require('./checklist')

async function main(event) {

  const details = event.detail
  const { userId, listId, email } = details

  return createResponse(
    checklist.addCollaboratorToList({ userId, listId, email }),
    {
      successCode: 201
    }
  )
}

module.exports = { main }
