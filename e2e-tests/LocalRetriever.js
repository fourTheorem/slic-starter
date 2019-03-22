export function generateEmailAddress() {
  return 'email'
    .concat(Math.floor(Math.random() * 10000) + 1)
    .concat('@example.com')
}

export function retrieveCode(email) {
  return '123456'
}
