const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const t = require('tap')

t.beforeEach(async (t) => {
  delete require.cache[require.resolve('../dynamo.js')]
})

t.test('A DynamoDB client is provided', async t => {
  const { dynamoDocClient } = require('../dynamo')
  const client = dynamoDocClient()
  t.type(client, DynamoDBDocumentClient)
})

t.test('A standard DynamoDB client is provided when the port is specified but is offline env var not set', async t => {
  process.env.DYNAMODB_LOCAL_PORT = '9000'
  const { dynamoDocClient } = require('../dynamo')
  const client = dynamoDocClient()

  t.type(client, DynamoDBDocumentClient)
  t.equal(client.config.isCustomEndpoint, false)
})

t.test('A local DynamoDB client is provided when offline', async t => {
  process.env.IS_OFFLINE = 'true'
  const { dynamoDocClient } = require('../dynamo')

  const client = dynamoDocClient()
  t.type(client, DynamoDBDocumentClient)

  const clientRegion = await client.config.region()
  t.equal(clientRegion, 'localhost')
  t.equal(client.config.isCustomEndpoint, true)
})
