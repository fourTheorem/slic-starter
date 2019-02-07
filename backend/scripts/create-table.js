var params = {
  TableName: 'checklists',
  KeySchema: [
    // The type of of schema.  Must start with a HASH type, with an optional second RANGE.
    {
      // Required HASH type attribute
      AttributeName: 'userId',
      KeyType: 'HASH'
    },
    {
      // Optional RANGE key type for HASH + RANGE tables
      AttributeName: 'listId',
      KeyType: 'RANGE'
    }
  ],
  AttributeDefinitions: [
    // The names and types of all primary and index key attributes only
    {
      AttributeName: 'userId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'listId',
      AttributeType: 'S'
    }
  ],
  ProvisionedThroughput: {
    // required provisioned throughput for the table
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
}

dynamodb.createTable(params, function(err, data) {
  if (err) ppJson(err)
  else ppJson(data)
})
