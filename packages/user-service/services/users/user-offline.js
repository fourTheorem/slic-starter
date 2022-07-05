import { extractEmail } from 'mock-amplify-auth';

export function get({ userId }) {
  return {
    userId,
    email: extractEmail(userId),
  };
}
