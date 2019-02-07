var params = {
  TableName: 'checklists',
  Key: {
    userId: 'eoin',
    listId: 'eoin-first-list'
  },
  UpdateExpression: 'SET #ent.#entId = :entry',
  ExpressionAttributeNames: {
    '#ent': 'entries',
    '#entId': 'ent123'
  },
  ExpressionAttributeValues: {
    ':entry': {
      title: 'Get the milk',
      value: 'Done'
    }
  },
  ReturnValues: 'ALL_NEW'
}
docClient.update(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
