import { v4 as uuid } from 'uuid';
import { test } from 'tap';

import { invitation, parseCode } from '../../lib/invitation.js';

const listName = 'The quick fox jumps over the lazy dog';
const userId = uuid();
const listId = uuid();
const email = 'example@example.com';

test('A code can be created and parsed', async (t) => {
  const secret = `passw0rd+${uuid()}`;
  const { createCode, parseCode } = invitation(secret);

  const code = createCode({ userId, listId, listName, email });
  t.equal(typeof code, 'string');
  const parsedCode = parseCode(code);

  t.same(parsedCode, { userId, listId, listName, email });
});

test('A code can be created and parsed without a secret', (t) => {
  const basicParseCode = parseCode;
  const secret = `passw0rd+${uuid()}`;
  const { createCode } = invitation(secret);
  const code = createCode({ userId, listId, listName, email });
  const parsedCode = basicParseCode(code);
  t.same(parsedCode, { userId, listId, listName, email });
  t.end();
});

test('A code is different for a different email address', async (t) => {
  const secret = `passw0rd+${uuid()}`;

  const { createCode } = invitation(secret);

  const userId = uuid();
  const listId = uuid();
  const email = 'example@example.com';

  const code = createCode({ userId, listId, listName, email });

  const newEmail = 'different-user@example.com';
  const differentCode = createCode({
    userId,
    listId,
    listName,
    email: newEmail,
  });
  t.notEqual(code, differentCode);
});

test('A listname can be extracted from the code', async (t) => {
  const secret = `passw0rd+${uuid()}`;

  const { createCode } = invitation(secret);

  const userId = uuid();
  const listId = uuid();
  const email = 'example@example.com';

  const code = createCode({ userId, listId, listName, email });

  // Front end code for extracting list name starts here
  const normalized = code.replaceAll('-', '+').replaceAll('_', '/');
  const codeBuffer = Buffer.from(normalized, 'base64');
  const dataBuffer = codeBuffer.subarray(32);
  const nameLength = dataBuffer.readUInt8();
  const name = dataBuffer.subarray(1, nameLength + 1).toString();
  // ...ends here

  t.equal(name, listName);
});

test('A code does not match with a different secret', async (t) => {
  const { createCode: invite1CreateCode, parseCode: invite1ParseCode } =
    invitation(`'passw0rd${uuid()}`);

  const invite1code = invite1CreateCode({ userId, listId, listName, email });
  t.type(invite1code, 'string');
  t.ok(invite1ParseCode(invite1code));

  const { parseCode: invite2ParseCode } = invitation(`'n3ws3cr3t${uuid()}`);
  t.throws(() => invite2ParseCode(invite1code));
});

test('A code will not be created if missing required data', async (t) => {
  const secret = 'secret';
  const { createCode } = invitation(secret);
  t.throws(() => createCode({ userId, email }));
});

test('An invalid code with throw an error', async (t) => {
  const secret = 'secret';
  const { parseCode } = invitation(secret);
  t.throws(() => parseCode('abcdefg'));
});
