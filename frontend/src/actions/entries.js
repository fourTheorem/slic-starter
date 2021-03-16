import { API as AmplifyApi } from '@aws-amplify/api'
import { translateError } from '../errors'

export const ADD_ENTRY_REQUEST = 'ADD_ENTRY_REQUEST'
export const ADD_ENTRY_SUCCESS = 'ADD_ENTRY_SUCCESS'
export const ADD_ENTRY_FAILURE = 'ADD_ENTRY_FAILURE'

export function addEntry({ listId, title, value }) {
  const meta = { listId, title, value }
  return function (dispatch) {
    dispatch({ type: ADD_ENTRY_REQUEST })
    AmplifyApi.post('checklist-api', `/${listId}/entries`, {
      body: {
        title,
        value,
      },
    })
      .then((result) => {
        dispatch({ type: ADD_ENTRY_SUCCESS, payload: result, meta })
      })
      .catch((err) => {
        dispatch({ type: ADD_ENTRY_FAILURE, error: translateError(err) })
      })
  }
}

export const LOAD_ENTRIES_REQUEST = 'LOAD_ENTRIES_REQUEST'
export const LOAD_ENTRIES_SUCCESS = 'LOAD_ENTRIES_SUCCESS'
export const LOAD_ENTRIES_FAILURE = 'LOAD_ENTRIES_FAILURE'

export function loadEntries({ listId }) {
  const meta = { listId }
  return function (dispatch) {
    dispatch({ type: LOAD_ENTRIES_REQUEST })
    AmplifyApi.get('checklist-api', `/${listId}/entries`)
      .then((result) => {
        dispatch({ type: LOAD_ENTRIES_SUCCESS, payload: result, meta })
      })
      .catch((err) => {
        dispatch({ type: LOAD_ENTRIES_FAILURE, error: translateError(err) })
      })
  }
}

export const SET_ENTRY_VALUE_REQUEST = 'SET_ENTRY_VALUE_REQUEST'
export const SET_ENTRY_VALUE_SUCCESS = 'SET_ENTRY_VALUE_SUCCESS'
export const SET_ENTRY_VALUE_FAILURE = 'SET_ENTRY_VALUE_FAILURE'

export function setEntryValue({ listId, entry }) {
  return function (dispatch) {
    dispatch({ type: SET_ENTRY_VALUE_REQUEST, meta: { entry, listId } })
    AmplifyApi.put('checklist-api', `/${listId}/entries/${entry.entId}`, {
      body: entry,
    })
      .then((result) => {
        dispatch({ type: SET_ENTRY_VALUE_SUCCESS, meta: { entry, listId } })
      })
      .catch((err) => {
        dispatch({ type: SET_ENTRY_VALUE_FAILURE, error: translateError(err) })
      })
  }
}

export const REMOVE_ENTRY_REQUEST = 'REMOVE_ENTRY_REQUEST'
export const REMOVE_ENTRY_SUCCESS = 'REMOVE_ENTRY_SUCCESS'
export const REMOVE_ENTRY_FAILURE = 'REMOVE_ENTRY_FAILURE'

export function removeEntry({ listId, entId }) {
  return function (dispatch) {
    dispatch({ type: REMOVE_ENTRY_REQUEST })
    AmplifyApi.del('checklist-api', `/${listId}/entries/${entId}`)
      .then((result) => {
        dispatch({ type: REMOVE_ENTRY_SUCCESS, meta: { listId, entId } })
      })
      .catch((err) => {
        dispatch({ type: REMOVE_ENTRY_FAILURE, error: translateError(err) })
      })
  }
}
