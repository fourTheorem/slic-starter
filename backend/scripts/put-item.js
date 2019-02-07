var params = {
  TableName: 'checklists',
  Item: {
    userId: 'eoin',
    listId: 'eoin-first-list'
  }
}
docClient.put(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
