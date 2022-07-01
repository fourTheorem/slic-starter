const { createResponse } = require('slic-tools/response');
const { processEvent } = require('slic-tools/event-util');
const checklist = require('./checklist');

async function main(event) {
  const { pathParameters, userId } = processEvent(event);
  const { id: listId } = pathParameters;
  return createResponse(checklist.remove({ listId, userId }));
}

module.exports = { main };
