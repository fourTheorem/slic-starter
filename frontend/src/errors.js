export const UNKNOWN = Symbol('UNKNOWN')
export const USER_NOT_CONFIRMED = Symbol('USER_NOT_CONFIRMED')
export const USER_NOT_FOUND = Symbol('USER_NOT_FOUND')
export const INVALID_PASSWORD = Symbol('INVALID_PASSWORD')
export const UNKNOWN_AUTHENTICATION_ERROR = Symbol('UNKNOWN_AUTHENTICATION_ERROR')
export const USER_ALREADY_EXISTS = Symbol('USER_ALREADY_EXISTS')
export const INVALID_EMAIL = Symbol('INVALID_EMAIL')
export const NO_USERNAME_PROVIDED = Symbol('NO_USERNAME_PROVIDED')
export const NOT_AUTHORIZED_EXCEPTION = Symbol('NOT_AUTHORIZED_EXCEPTION')
export const CODE_MISMATCH_EXCEPTION = Symbol('CODE_MISMATCH_EXCEPTION')
export const EXPIRED_CODE_EXCEPTION = Symbol('EXPIRED_CODE_EXCEPTION')
export const LIMIT_EXCEEDED_EXCEPTION = Symbol('LIMIT_EXCEEDED_EXCEPTION')

export const messages = {
  [USER_NOT_CONFIRMED]: 'The user account has not been confirmed',
  [USER_NOT_FOUND]: 'That user could not be found',
  [UNKNOWN_AUTHENTICATION_ERROR]: 'An error occured',
  [INVALID_PASSWORD]: 'Invalid password',
  [USER_ALREADY_EXISTS]: 'An account with that email already exists',
  [UNKNOWN]: 'An unexpected error occurred',
  [INVALID_EMAIL]: 'Invalid email format',
  [NO_USERNAME_PROVIDED]: 'No email has been provided',
  [NOT_AUTHORIZED_EXCEPTION]: 'Incorrect Username or Password',
  [CODE_MISMATCH_EXCEPTION]: 'The code entered is incorrect',
  [EXPIRED_CODE_EXCEPTION]: 'That code is expired, request a new code',
  [LIMIT_EXCEEDED_EXCEPTION]: 'Attempt limit exceeded, try again later'
}

export function translateError (err) {
  let errorId

  switch (err.message) {
    default:
      errorId = UNKNOWN
      break
  }

  return {
    id: errorId,
    src: err
  }
}
