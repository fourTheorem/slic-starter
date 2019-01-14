export const UNKNOWN = Symbol()
export const USER_NOT_CONFIRMED = Symbol()
export const USER_NOT_FOUND = Symbol()
export const INVALID_PASSWORD = Symbol()
export const UNKNOWN_AUTHENTICATION_ERROR = Symbol()

export const messages = {
  [USER_NOT_CONFIRMED]: 'The user account has not been confirmed',
  [USER_NOT_FOUND]: 'That user could not be found',
  [UNKNOWN_AUTHENTICATION_ERROR]: 'Login failed',
  [INVALID_PASSWORD]: 'Invalid password',
  [UNKNOWN]: 'An unexpected error occurred'
}
