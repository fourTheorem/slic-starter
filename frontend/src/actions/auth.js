import { Auth } from 'aws-amplify'
import * as errors from '../errors'

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

export function logIn({ username, password }) {
  return function(dispatch) {
    dispatch({ type: LOGIN_REQUEST })
    Auth.signIn(username, password).then(
      () => dispatch({ type: LOGIN_SUCCESS }),
      err =>
        dispatch({ type: LOGIN_FAILURE, error: translateCognitoError(err) })
    )
  }
}

function translateCognitoError(cognitoErr) {
  let errorId

  switch (cognitoErr.code) {
    case 'UserNotConfirmedException':
      errorId = errors.USER_NOT_CONFIRMED
      break
    case 'UserNotFoundException':
      errorId = errors.USER_NOT_FOUND
      break
    default:
      errorId = errors.UNKNOWN_AUTHENTICATION_ERROR
      break
  }

  return {
    id: errorId
  }
}
