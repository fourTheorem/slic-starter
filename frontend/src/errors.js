export const UNKNOWN = Symbol()
export const USER_NOT_CONFIRMED = Symbol()
export const USER_NOT_FOUND = Symbol()
export const INVALID_PASSWORD = Symbol()
export const UNKNOWN_AUTHENTICATION_ERROR = Symbol()
export const USER_ALREADY_EXISTS = Symbol()
export const INVALID_EMAIL = Symbol()
export const NO_USERNAME_PROVIDED = Symbol()
export const NOT_AUTHORIZED_EXCEPTION = Symbol()
export const CODE_MISMATCH_EXCEPTION = Symbol()
export const EXPIRED_CODE_EXCEPTION = Symbol()
export const LIMIT_EXCEEDED_EXCEPTION = Symbol()

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
  [LIMIT_EXCEEDED_EXCEPTION]: 'Attempt limit exceeded, try again later',
}

export function translateError(err) {
  let errorId

  switch (err.message) {
    default:
      errorId = UNKNOWN
      break
  }

  return {
    id: errorId,
    src: err,
  }
}
