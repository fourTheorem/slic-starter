const chance = require('chance').Chance()

export function generateEmailAddress() {
  return chance.email()
}

export function retrieveCode(email) {
  const code = chance.integer({ min: 111111, max: 999999 })

  return code.toString()
}
