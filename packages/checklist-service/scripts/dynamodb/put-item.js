const params = {
  TableName: 'checklists',
  Item: {
    userId: '1',
    listId: '11',
  },
};
documentdb.put(params, (err, data) => {
  if (err) ppJson(err);
  // an error occurred
  else ppJson(data); // successful response
});
