var params = {
  Limit: 100
}
dynamodb.listTables(params, function(err, data) {
  if (err) ppJson(err)
  // an error occurred
  else ppJson(data) // successful response
})
