const { v4: uuid } = require('uuid');

const userId = uuid();

const userRequestContext = {
  authorizer: {
    claims: {
      'cognito:username': userId,
    },
  },
};

module.exports = {
  userId,
  userRequestContext,
};
