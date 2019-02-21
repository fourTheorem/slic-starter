var params = {
  TableName: 'checklists',
  Key: {
    userId: 'eoin',
    listId: 'eoin-first-list'
  },
  UpdateExpression: 'REMOVE #ent.#entId',
  ExpressionAttributeNames: {
    '#ent': 'entries',
    '#entId': 'ent124'
  },
  ReturnValues: 'ALL_NEW'
}
docClient.update(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
