import { parseCode } from '../lib/invitation.js';

const code = process.argv[2];
const secret = process.argv[3];

if (!code) {
  throw new Error('Specify a code as an argument');
}

console.error('Parsing code', code);

const parsed = parseCode(code, secret);

console.log(JSON.stringify(parsed, undefined, ' '));
