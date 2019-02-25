import { API as AmplifyApi } from 'aws-amplify'
import { translateError } from '../errors'

export const ADD_ENTRY_REQUEST = 'ADD_ENTRY_REQUEST'
export const ADD_ENTRY_SUCCESS = 'ADD_ENTRY_SUCCESS'
export const ADD_ENTRY_FAILURE = 'ADD_ENTRY_FAILURE'

export const LIST_ENTRIES_REQUEST = 'LIST_ENTRIES_REQUEST'
export const LIST_ENTRIES_SUCCESS = 'LIST_ENTRIES_SUCCESS'
export const LIST_ENTRIES_FAILURE = 'LIST_ENTRIES_FAILURE'

export function addEntry({ listId, title }) {
  const meta = { listId, title }
  return function(dispatch) {
    dispatch({ type: ADD_ENTRY_REQUEST })
    AmplifyApi.post('checklists', `/checklist/${listId}/entries`, {
      body: {
        title
      }
    })
      .then(result => {
        dispatch({ type: ADD_ENTRY_SUCCESS, payload: result, meta })
      })
      .catch(err => {
        dispatch({ type: ADD_ENTRY_FAILURE, error: translateError(err) })
      })
  }
}

export function listEntries({ listId }) {
  const meta = { listId }
  return function(dispatch) {
    dispatch({ type: LIST_ENTRIES_REQUEST })
    AmplifyApi.get('checklists', `/checklist/${listId}/entries`)
      .then(result => {
        dispatch({ type: LIST_ENTRIES_SUCCESS })
      })
      .catch(err => {
        dispatch({ type: LIST_ENTRIES_FAILURE, error: translateError(err) })
      })
  }
}
