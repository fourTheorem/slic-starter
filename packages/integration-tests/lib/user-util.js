import jwt from 'jsonwebtoken';
import { rword } from 'rword';
import { createUser, deleteUser } from './cognito-util.js';

const stage = process.env.SLIC_STAGE || 'local';

let userPromise;

async function createActualUser() {
  if (stage === 'local') {
    const userId = rword.generate(3).join('-');
    const email = `${userId}@example.com`;
    // SLIC backend with serverless-offline will derive the
    // user context by JWT-decoding the Authorization header
    return {
      idToken: jwt.sign({ 'cognito:username': userId, email }, 'dummy-key'),
      email,
      userId,
    };
  }
  return createUser();
}

export function getUser() {
  if (!userPromise) {
    userPromise = createActualUser();
  }
  return userPromise;
}

export async function removeUser() {
  const user = await getUser();
  if (stage !== 'local') {
    await deleteUser(user);
    userPromise = undefined;
  }
}
