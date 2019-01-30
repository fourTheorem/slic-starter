import { Auth } from 'aws-amplify'
import * as errors from '../errors'

export const SIGNUP_REQUEST = 'SIGNUP_REQUEST'
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS'
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE'

export function signUp({ email, password }) {
  return function(dispatch) {
    dispatch({ type: SIGNUP_REQUEST })
    Auth.signUp(email, password).then(
      () => dispatch({ type: SIGNUP_SUCCESS, payload: { email } }),
      err =>
        dispatch({ type: SIGNUP_FAILURE, error: translateCognitoError(err) })
    )
  }
}

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

export function logIn({ email, password }) {
  return function(dispatch) {
    dispatch({ type: LOGIN_REQUEST })
    Auth.signIn(email, password).then(
      () => dispatch({ type: LOGIN_SUCCESS }),
      err =>
        dispatch(
          { type: LOGIN_FAILURE, error: translateCognitoError(err) },
          console.log({ email, password })
        )
    )
  }
}

export const LOGIN_VALIDATED = 'LOGIN_VALIDATED'

export function checkAuthentication() {
  return function(dispatch) {
    Auth.currentSession().then(() => dispatch({ type: LOGIN_VALIDATED }))
  }
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

export function logOut() {
  return function(dispatch) {
    dispatch({ type: LOGOUT_REQUEST })
    Auth.signOut().then(
      () => dispatch({ type: LOGOUT_SUCCESS }),
      err => dispatch({ type: LOGOUT_FAILURE, error: err })
    )
  }
}

export const SIGNUP_CONFIRM_REQUEST = 'SIGNUP_CONFIRM_REQUEST'
export const SIGNUP_CONFIRM_SUCCESS = 'SIGNUP_CONFIRM_SUCCESS'
export const SIGNUP_CONFIRM_FAILURE = 'SIGNUP_CONFIRM_FAILURE'

export function confirmSignup(email, confirmationCode) {
  return function(dispatch) {
    dispatch({ type: SIGNUP_CONFIRM_REQUEST })
    Auth.confirmSignUp(email, confirmationCode).then(
      () => dispatch({ type: SIGNUP_CONFIRM_SUCCESS }),
      err =>
        dispatch(
          { type: SIGNUP_CONFIRM_FAILURE, error: translateCognitoError(err) },
          console.log({ email, confirmationCode })
        )
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
    case 'InvalidPasswordException':
      errorId = errors.INVALID_PASSWORD
      break
    case 'UsernameExistsException':
      errorId = errors.USER_ALREADY_EXISTS
      break
    case 'InvalidParameterException':
      errorId = errors.INVALID_EMAIL
      break
    case 'NotAuthorizedException':
      errorId = errors.NOT_AUTHORIZED_EXCEPTION
      break
    default:
      console.warn({ cognitoErr }, 'Unrecognised cognito error')
      errorId = errors.UNKNOWN_AUTHENTICATION_ERROR
      break
  }

  return {
    id: errorId
  }
}
