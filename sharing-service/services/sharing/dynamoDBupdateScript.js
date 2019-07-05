
  const result = await dynamoDocClient()
    .update({
      TableName: tableName,
      Key: { userId, listId },
      UpdateExpression: 'SET #collaborators = :collaborators',
      ExpressionAttributeNames: {
        '#collaborators': 'collaborators'
      },
      ExpressionAttributeValues: {
        ':collaborators': '{1234-5678, 0123-4567}'
      },
      ReturnValues: 'ALL_NEW'
    })
    .promise()
  return result.Attributes
