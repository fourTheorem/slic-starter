const AWS = require('aws-sdk')
const Uuid = require('uuid')

AWS.config.update({ region: process.env.AWS_REGION })

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const tableName = 'checklists'

module.exports = {
  addItem,
  updateItem,
  listItems,
  deleteItem
}

async function addItem({ userId, listId, title, value }) {
  const entId = Uuid.v4()
  const params = {
    TableName: tableName,

    Key: {
      userId,
      listId
    },

    UpdateExpression: 'SET #ent.#entId = :entry',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId
    },

    ExpressionAttributeValues: {
      ':entry': {
        title,
        value
      }
    },

    ReturnValues: 'ALL_NEW'
  }

  dynamoDb.update(params, function(err, data) {
    if (err) console.log(err)
    else console.log(data)
  })
}

async function updateItem({ entId, value }) {
  const params = {
    TableName: tableName,
    Key: { entId },
    UpdateExpression: 'SET value = :value',
    ExpressionAttributeValues: {
      value: value
    }
  }
  await dynamoDb.update(params, function(err, data) {
    if (err) console.log(err)
    else console.log(data)
  })
}

async function listItems({ listId }) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'listId = :listId',
    ExpressionAttributeValues: {
      listId: listId
    }
  }

  dynamoDb.query(params, function(err, data) {
    if (err) console.log(err)
    else console.log(data)
  })
}

async function deleteItem(userId, listId, entId) {
  const params = {
    TableName: tableName,
    Key: {
      userId,
      listId
    },

    UpdateExpression: 'Remove #ent.#entId',
    ExpressionAttributeNames: {
      '#ent': 'entries',
      '#entId': entId
    },

    ReturnValues: 'ALL_NEW'
  }

  dynamoDb.update(params, function(err, data) {
    if (err) console.log(err)
    else console.log(data)
  })
}
