import { API as AmplifyApi } from 'aws-amplify'
import * as errors from '../errors'

export const CREATE_LIST_REQUEST = 'CREATE_LIST_REQUEST'
export const CREATE_LIST_SUCCESS = 'CREATE_LIST_SUCCESS'
export const CREATE_LIST_FAILURE = 'CREATE_LIST_FAILURE'

export function createList({ name }) {
  return function(dispatch) {
    dispatch({ type: CREATE_LIST_REQUEST })
    AmplifyApi.post('checklists', '/checklist', {
      body: {
        name
      }
    })
      .then(result => {
        console.log('Result', result)
        dispatch({ type: CREATE_LIST_SUCCESS })
      })
      .catch(err => {
        console.log('Error', err)
        dispatch({ type: CREATE_LIST_FAILURE, error: translateError(err) })
      })
  }
}

function translateError(err) {
  let errorId

  switch (err.message) {
    default:
      errorId = errors.UNKNOWN
      break
  }

  return {
    id: errorId
  }
}
