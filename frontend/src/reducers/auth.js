import { LOGIN_REQUEST, LOGIN_FAILURE, LOGIN_SUCCESS } from '../actions/auth'

const defaultState = {
  loggingIn: false,
  authenticated: false,
  loginFailed: false
}

export default (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loggingIn: true,
        authenticated: false,
        error: null
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        authenticated: true,
        error: null
      }
    case LOGIN_FAILURE:
      return {
        ...state,
        loggingIn: false,
        authenticated: false,
        error
      }
    default:
      return state
  }
}
