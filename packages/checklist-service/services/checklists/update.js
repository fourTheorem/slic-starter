const { createResponse } = require('slic-tools/response');
const { processEvent } = require('slic-tools/event-util');
const checklist = require('./checklist');

async function main(event) {
  const { body, pathParameters, userId } = processEvent(event);
  const { name, description } = body;
  const { id: listId } = pathParameters;
  return createResponse(
    checklist.update({ listId, userId, name, description })
  );
}

module.exports = { main };
