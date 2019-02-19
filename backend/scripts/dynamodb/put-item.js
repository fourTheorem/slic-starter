var params = {
  TableName: 'checklists',
  Item: {
    userId: '1',
    listId: '11'
  }
}
documentdb.put(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
