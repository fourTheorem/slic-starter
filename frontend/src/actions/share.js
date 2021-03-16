import { API as AmplifyApi } from '@aws-amplify/api'
import { translateError } from '../errors'

export const CREATE_SHARE_REQUEST = 'CREATE_SHARE_REQUEST'
export const CREATE_SHARE_SUCCESS = 'CREATE_SHARE_SUCCESS'
export const CREATE_SHARE_FAILURE = 'CREATE_SHARE_FAILURE'

export const EDIT_SHARE = 'EDIT_SHARE'
export const CANCEL_SHARE = 'CANCEL_SHARE'

export function cancelShare() {
  return function (dispatch) {
    dispatch({ type: CANCEL_SHARE })
  }
}

export function editShare() {
  return function (dispatch) {
    dispatch({ type: EDIT_SHARE })
  }
}

export function createShare({ email, listId, listName }) {
  return function (dispatch) {
    dispatch({ type: CREATE_SHARE_REQUEST })
    AmplifyApi.post('sharing-api', '', {
      body: {
        email,
        listId,
        listName,
      },
    })
      .then((result) => {
        dispatch({
          type: CREATE_SHARE_SUCCESS,
          payload: result,
          meta: { email },
        })
      })
      .catch((err) => {
        dispatch({ type: CREATE_SHARE_FAILURE, error: translateError(err) })
      })
  }
}

export const ACCEPT_SHARE_REQUEST = 'ACCEPT_SHARE_REQUEST'
export const ACCEPT_SHARE_SUCCESS = 'ACCEPT_SHARE_SUCCESS'
export const ACCEPT_SHARE_FAILURE = 'ACCEPT_SHARE_FAILURE'

export function acceptShareRequest(code) {
  return function (dispatch) {
    dispatch({ type: ACCEPT_SHARE_REQUEST })
    AmplifyApi.patch('sharing-api', `/${code}`, {
      body: {
        code: code,
      },
    })
      .then((result) => {
        dispatch({ type: ACCEPT_SHARE_SUCCESS })
      })
      .catch((err) => {
        dispatch({ type: ACCEPT_SHARE_FAILURE, error: translateError(err) })
      })
  }
}
