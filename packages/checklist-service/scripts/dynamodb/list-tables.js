const params = {
  Limit: 100,
};
dynamodb.listTables(params, (err, data) => {
  if (err) ppJson(err);
  // an error occurred
  else ppJson(data); // successful response
});
