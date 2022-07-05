import chance from 'chance';

export function generateEmailAddress() {
  return chance().email();
}

export function retrieveCode(email) {
  const code = chance().integer({ min: 111_111, max: 999_999 });

  return code.toString();
}
