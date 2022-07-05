import { v4 as uuid } from 'uuid';

export const userId = uuid();

export const userRequestContext = {
  authorizer: {
    claims: {
      'cognito:username': userId,
    },
  },
};
