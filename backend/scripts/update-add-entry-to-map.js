var params = {
  TableName: 'checklists',
  Key: {
    userId: 'offlineContext_cognitoIdentityId',
    listId: '03fc7a43-6448-4cff-a545-fa0c673153da'
  },
  UpdateExpression: 'SET #ent.#entId = :entry',
  ExpressionAttributeNames: {
    '#ent': 'entries',
    '#entId': '8177584d-2965-4cf0-8834-ddcab1399aa6'
  },
  ExpressionAttributeValues: {
    ':entry': {
      title: 'Item One'
    }
  },
  ReturnValues: 'ALL_NEW'
}

/*
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
*/
docClient.update(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
