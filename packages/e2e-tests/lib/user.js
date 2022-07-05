import nid from 'nid';

import { getEmail } from './config.js';

export function generateUser() {
  return {
    email: getEmail(),
    password: `${nid(4).toUpperCase()}${nid(6)}${Math.floor(
      Math.random() * 100
    )}!$`,
  };
}
