const { createResponse } = require('slic-tools/response');
const { processEvent } = require('slic-tools/event-util');
const checklist = require('./checklist');

async function main(event) {
  const { body, userId } = processEvent(event);
  const { name, description } = body;
  return createResponse(checklist.create({ userId, name, description }), {
    successCode: 201,
  });
}
module.exports = { main };
