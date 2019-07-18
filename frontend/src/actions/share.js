import { API as AmplifyApi } from 'aws-amplify'
import { translateError } from '../errors'

import { localMode } from '../mode'

const sharePath = localMode ? '' : '/share'
export const ADD_COLLABORATOR_REQUEST = 'ADD_COLLABORATOR_REQUEST'
export const ADD_COLLABORATOR_SUCCESS = 'ADD_COLLABORATOR_SUCCESS'
export const ADD_COLLABORATOR_FAILURE = 'ADD_COLLABORATOR_FAILURE'

export function addCollaborator({ email, listId }) {
  return function(dispatch) {
    dispatch({ type: ADD_COLLABORATOR_REQUEST })
    AmplifyApi.post('checklists', `${sharePath}/${listId}`, {
      body: {
        email,
        listId
      }
    })
      .then(result => {
        dispatch({
          type: ADD_COLLABORATOR_SUCCESS,
          payload: result,
          meta: { email }
        })
      })
      .catch(err => {
        dispatch({ type: ADD_COLLABORATOR_FAILURE, error: translateError(err) })
      })
  }
}

export const LOAD_COLLABORATOR_REQUEST = 'LOAD_COLLABORATOR_REQUEST'
export const LOAD_COLLABORATOR_SUCCESS = 'LOAD_COLLABORATOR_SUCCESS'
export const LOAD_COLLABORATOR_FAILURE = 'LOAD_COLLABORATOR_FAILURE'

export function loadCollaborators({ listId }) {
  return function(dispatch) {
    const meta = { listId }
    dispatch({ type: LOAD_COLLABORATOR_REQUEST })
    AmplifyApi.get('checklists', `${sharePath}/${listId}/collaborators`)
      .then(result => {
        dispatch({ type: LOAD_COLLABORATOR_SUCCESS, payload: result, meta })
      })
      .catch(err => {
        dispatch({
          type: LOAD_COLLABORATOR_FAILURE,
          error: translateError(err)
        })
      })
  }
}

export const REMOVE_COLLABORATOR_REQUEST = 'REMOVE_COLLABORATOR_REQUEST'
export const REMOVE_COLLABORATOR_SUCCESS = 'REMOVE_COLLABORATOR_SUCCESS'
export const REMOVE_COLLABORATOR_FAILURE = 'REMOVE_COLLABORATOR_FAILURE'

export function removeCollaborator({ listId, email }) {
  //TODO: Decide between email or userId
  return function(dispatch) {
    dispatch({ type: REMOVE_COLLABORATOR_REQUEST })
    AmplifyApi.del(
      'checklists',
      `${sharePath}/${listId}/collaborators/${email}`
    )
      .then(result => {
        dispatch({ type: REMOVE_COLLABORATOR_SUCCESS })
      })
      .catch(err => {
        dispatch({
          type: REMOVE_COLLABORATOR_FAILURE,
          error: translateError(err)
        })
      })
  }
}

export const ACCEPT_SHARE_REQUEST = 'ACCEPT_SHARE_REQUEST'
export const ACCEPT_SHARE_SUCCESS = 'ACCEPT_SHARE_SUCCESS'
export const ACCEPT_SHARE_FAILURE = 'ACCEPT_SHARE_FAILURE'

export function acceptShareRequest(code) {
  return function(dispatch) {
    dispatch({ type: ACCEPT_SHARE_REQUEST })
    AmplifyApi.post('checklists', `${sharePath}/confirm/${code}`, {
      body: {
        code: code
      }
    })
      .then(result => {
        dispatch({ type: ACCEPT_SHARE_SUCCESS })
      })
      .catch(err => {
        dispatch({ type: ACCEPT_SHARE_FAILURE, error: translateError(err) })
      })
  }
}
