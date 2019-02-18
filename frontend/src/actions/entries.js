import { API as AmplifyApi } from 'aws-amplify'
import { translateError } from '../errors'

export const ADD_ENTRY_REQUEST = 'ADD_ENTRY_REQUEST'
export const ADD_ENTRY_SUCCESS = 'ADD_ENTRY_SUCCESS'
export const ADD_ENTRY_FAILURE = 'ADD_ENTRY_FAILURE'

export function addEntry({ listId, title }) {
  return function(dispatch) {
    dispatch({ type: ADD_ENTRY_REQUEST })
    AmplifyApi.post('checklists', `/checklist/${listId}/entries`, {
      body: {
        title
      }
    })
      .then(result => {
        dispatch({ type: ADD_ENTRY_SUCCESS, payload: result })
      })
      .catch(err => {
        dispatch({ type: ADD_ENTRY_FAILURE, error: translateError(err) })
      })
  }
}
