var params = {
  TableName: 'checklists',
  Key: {
    userId: 'eoin', //(string | number | boolean | null | Binary)
    listId: 'eoin-first-list'
  },
  UpdateExpression: 'SET #ent = :entries', // String representation of the update to an attribute
  // SET set-action , ...
  // REMOVE remove-action , ...  (for document support)
  // ADD add-action , ...
  // DELETE delete-action , ...  (previous DELETE equivalent)
  ExpressionAttributeNames: {
    '#ent': 'entries'
  },
  ExpressionAttributeValues: {
    ':entries': {}
  },
  ReturnValues: 'UPDATED_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
  ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
  ReturnItemCollectionMetrics: 'NONE' // optional (NONE | SIZE)
}
docClient.update(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
