import { API as AmplifyApi } from 'aws-amplify'
import { translateError } from '../errors'

export const ADD_ENTRY_REQUEST = 'ADD_ENTRY_REQUEST'
export const ADD_ENTRY_SUCCESS = 'ADD_ENTRY_SUCCESS'
export const ADD_ENTRY_FAILURE = 'ADD_ENTRY_FAILURE'

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

export const LOAD_ENTRIES_REQUEST = 'LOAD_ENTRIES_REQUEST'
export const LOAD_ENTRIES_SUCCESS = 'LOAD_ENTRIES_SUCCESS'
export const LOAD_ENTRIES_FAILURE = 'LOAD_ENTRIES_FAILURE'

export function loadEntries({ listId }) {
  const meta = { listId }
  return function(dispatch) {
    dispatch({ type: LOAD_ENTRIES_REQUEST })
    AmplifyApi.get('checklists', `/checklist/${listId}/entries`)
      .then(result => {
        dispatch({ type: LOAD_ENTRIES_SUCCESS, payload: result, meta })
      })
      .catch(err => {
        dispatch({ type: LOAD_ENTRIES_FAILURE, error: translateError(err) })
      })
  }
}
