import { API as AmplifyApi } from '@aws-amplify/api'
import { translateError } from '../errors'

export const LOAD_LISTS_REQUEST = 'LOAD_LISTS_REQUEST'
export const LOAD_LISTS_SUCCESS = 'LOAD_LISTS_SUCCESS'
export const LOAD_LISTS_FAILURE = 'LOAD_LISTS_FAILURE'

export function loadLists() {
  return function (dispatch) {
    dispatch({ type: LOAD_LISTS_REQUEST })
    AmplifyApi.get('checklist-api', '')
      .then((result) => {
        dispatch({ type: LOAD_LISTS_SUCCESS, payload: result })
      })
      .catch((err) => {
        dispatch({ type: LOAD_LISTS_FAILURE, error: translateError(err) })
      })
  }
}

export const CREATE_LIST_REQUEST = 'CREATE_LIST_REQUEST'
export const CREATE_LIST_SUCCESS = 'CREATE_LIST_SUCCESS'
export const CREATE_LIST_FAILURE = 'CREATE_LIST_FAILURE'

export function createList({ name, description }) {
  return function (dispatch) {
    dispatch({ type: CREATE_LIST_REQUEST })
    AmplifyApi.post('checklist-api', '', {
      body: {
        name,
        description,
      },
    })
      .then((result) => {
        dispatch({ type: CREATE_LIST_SUCCESS, payload: result })
      })
      .catch((err) => {
        dispatch({ type: CREATE_LIST_FAILURE, error: translateError(err) })
      })
  }
}

export const REMOVE_LIST_REQUEST = 'REMOVE_LIST_REQUEST'
export const REMOVE_LIST_SUCCESS = 'REMOVE_LIST_SUCCESS'
export const REMOVE_LIST_FAILURE = 'REMOVE_LIST_FAILURE'

export function removeList({ listId }) {
  return function (dispatch) {
    const meta = { listId }
    dispatch({ type: REMOVE_LIST_REQUEST, meta })
    AmplifyApi.del('checklist-api', `/${listId}`)
      .then((result) => {
        dispatch({ type: REMOVE_LIST_SUCCESS, meta })
      })
      .catch((err) => {
        dispatch({ type: REMOVE_LIST_FAILURE, error: translateError(err) })
      })
  }
}

export const UPDATE_LIST_REQUEST = 'UPDATE_LIST_REQUEST'
export const UPDATE_LIST_SUCCESS = 'UPDATE_LIST_SUCCESS'
export const UPDATE_LIST_FAILURE = 'UPDATE_LIST_FAILURE'

export function updateList({ listId, name, description }) {
  return function (dispatch) {
    const meta = { listId }
    dispatch({ type: UPDATE_LIST_REQUEST })
    AmplifyApi.put('checklist-api', `/${listId}`, {
      body: {
        name,
        description,
      },
    })
      .then((result) => {
        dispatch({ type: UPDATE_LIST_SUCCESS, meta, payload: result })
      })
      .catch((err) => {
        dispatch({ type: UPDATE_LIST_FAILURE, error: translateError(err) })
      })
  }
}
