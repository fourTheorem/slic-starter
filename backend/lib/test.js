const eventUtil = require('./event-util')

async function testEvents() {
  await eventUtil.createNewListEvent()
}

testEvents()
