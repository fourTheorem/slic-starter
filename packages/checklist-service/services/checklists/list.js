const { createResponse } = require('slic-tools/response');
const { processEvent } = require('slic-tools/event-util');
const checklist = require('./checklist');

async function main(event) {
  const { userId } = processEvent(event);
  return createResponse(checklist.list({ userId }));
}

module.exports = { main };
