import {
  LOGIN_REQUEST,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGIN_VALIDATED,
  LOGOUT_SUCCESS,
  SIGNUP_REQUEST,
  SIGNUP_FAILURE,
  SIGNUP_SUCCESS,
  SIGNUP_CONFIRM_REQUEST,
  SIGNUP_CONFIRM_SUCCESS,
  SIGNUP_CONFIRM_FAILURE
} from '../actions/auth'

const defaultState = {
  loggingIn: false,
  loginFailed: false
}

export default (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loggingIn: true,
        authenticated: false,
        loginError: null
      }
    case LOGIN_SUCCESS:
    case LOGIN_VALIDATED:
      return {
        ...state,
        loggingIn: false,
        authenticated: true,
        loginError: null
      }
    case LOGIN_FAILURE:
      return {
        ...state,
        loggingIn: false,
        authenticated: false,
        loginError: error
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        authenticated: false
      }
    case SIGNUP_REQUEST:
      return {
        ...state,
        signingUp: true,
        signupError: null,
        userConfirmed: false,
        signedUp: false
      }
    case SIGNUP_SUCCESS:
      // TODO - Add post-signup authentication
      return {
        ...state,
        signingUp: false,
        signupError: null,
        userConfirmed: false,
        signedUp: true,
        email: payload.email
      }
    case SIGNUP_FAILURE:
      return {
        ...state,
        signingUp: false,
        signupError: error,
        userConfirmed: false,
        signedUp: false
      }
    case SIGNUP_CONFIRM_REQUEST:
      return {
        ...state,
        confirmingSignup: true,
        confirmationError: null,
        signupConfirmed: false
      }
    case SIGNUP_CONFIRM_SUCCESS:
      return {
        ...state,
        confirmingSignup: false,
        confirmationError: null,
        signupConfirmed: true
      }
    case SIGNUP_CONFIRM_FAILURE:
      return {
        ...state,
        confirmingSignup: false,
        confirmationError: error,
        signupConfirmed: false
      }

    default:
      return state
  }
}
