import {
  LOGOUT_SUCCESS,
  LOGIN_REQUEST,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGIN_INVALIDATED,
  LOGIN_VALIDATED,
  SIGNUP_REQUEST,
  SIGNUP_FAILURE,
  SIGNUP_SUCCESS,
  SIGNUP_CONFIRM_REQUEST,
  SIGNUP_CONFIRM_SUCCESS,
  SIGNUP_CONFIRM_FAILURE,
  RESEND_CODE_REQUEST,
  RESEND_CODE_SUCCESS,
  SET_PRE_AUTHENTICATED_PATH,
  RESEND_CODE_FAILURE,
} from '../actions/auth'
import * as errors from '../errors'

const defaultState = {
  preAuthenticatedPath: null,
  loggingIn: false,
  loginFailed: false,
}

const reducer = (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case SET_PRE_AUTHENTICATED_PATH:
      return {
        ...state,
        preAuthenticatedPath: payload,
      }
    case LOGIN_REQUEST:
      return {
        ...state,
        loggingIn: true,
        authenticated: false,
        loginError: null,
        email: payload.email,
      }
    case LOGIN_SUCCESS:
    case LOGIN_VALIDATED:
      return {
        ...state,
        loggingIn: false,
        authenticated: true,
        loginError: null,
      }
    case LOGIN_INVALIDATED:
      return {
        ...state,
        authenticated: false,
      }
    case LOGIN_FAILURE:
      return {
        ...state,
        loggingIn: false,
        authenticated: false,
        loginError: error,
        userUnconfirmed: error.id === errors.USER_NOT_CONFIRMED,
      }
    case LOGOUT_SUCCESS:
      return {
        preAuthenticatedPath: null,
        authenticated: false,
      }
    case SIGNUP_REQUEST:
      return {
        ...state,
        signingUp: true,
        signupError: null,
        userConfirmed: false,
        signedUp: false,
      }
    case SIGNUP_SUCCESS:
      return {
        ...state,
        signingUp: false,
        signupError: null,
        userConfirmed: false,
        signedUp: true,
        email: payload.email,
      }
    case SIGNUP_FAILURE:
      return {
        ...state,
        signingUp: false,
        signupError: error,
        userConfirmed: false,
        signedUp: false,
      }
    case SIGNUP_CONFIRM_REQUEST:
      return {
        ...state,
        confirmingSignup: true,
        confirmationError: null,
        signupConfirmed: false,
      }
    case SIGNUP_CONFIRM_SUCCESS:
      return {
        confirmingSignup: false,
        confirmationError: null,
        authenticated: false,
        signupConfirmed: true,
        email: payload.email,
      }
    case SIGNUP_CONFIRM_FAILURE:
      return {
        ...state,
        confirmingSignup: false,
        confirmationError: error,
        authenticated: false,
        signupConfirmed: false,
      }
    case RESEND_CODE_REQUEST:
      return {
        ...state,
        resendingCode: true,
        resendError: null,
        codeSent: false,
      }

    case RESEND_CODE_SUCCESS:
      return {
        ...state,
        resendingCode: false,
        resendError: null,
        codeSent: true,
      }

    case RESEND_CODE_FAILURE:
      return {
        ...state,
        resendingCode: false,
        resendError: error,
        codeSent: false,
      }

    default:
      return state
  }
}

export default reducer
