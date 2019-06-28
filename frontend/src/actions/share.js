import { API as AmplifyApi } from 'aws-amplify'
import { translateError } from '../errors'

export const ADD_COLLABORATOR_REQUEST = 'ADD_COLLABORATOR_REQUEST'
export const ADD_COLLABORATOR_SUCCESS = 'ADD_COLLABORATOR_SUCCESS'
export const ADD_COLLABORATOR_FAILURE = 'ADD_COLLABORATOR_FAILURE'

export function addCollaborator({ emailAddress, listId }) {
  return function(dispatch) {
    dispatch({ ADD_COLLABORATOR_REQUEST })
    AmplifyApi.post('checklists', `/checklist/{listId}/collaborators`, {
      body: {
        emailAddress
      }
    })
      .then(result => {
        dispatch({ type: ADD_COLLABORATOR_SUCCESS, payload: result })
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
    dispatch({ type: LOAD_COLLABORATOR_REQUEST })
    AmplifyApi.get('checklists', `/checklist/${listId}/collaborators`)
      .then(result => {
        dispatch({ type: LOAD_COLLABORATOR_SUCCESS, payload: result })
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
    AmplifyApi.del('checklists', `/checklist/${listId}/collaborators/${email}`)
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
