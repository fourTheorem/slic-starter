import findIndex from 'lodash/findIndex'
import { LOCATION_CHANGE } from 'connected-react-router'

import {
  LOAD_LISTS_REQUEST,
  LOAD_LISTS_SUCCESS,
  LOAD_LISTS_FAILURE,
  CREATE_LIST_REQUEST,
  CREATE_LIST_SUCCESS,
  CREATE_LIST_FAILURE,
  UPDATE_LIST_REQUEST,
  UPDATE_LIST_SUCCESS,
  UPDATE_LIST_FAILURE,
  REMOVE_LIST_REQUEST,
  REMOVE_LIST_SUCCESS,
  REMOVE_LIST_FAILURE
} from '../actions/checklists'

import {
  ADD_ENTRY_REQUEST,
  ADD_ENTRY_SUCCESS,
  ADD_ENTRY_FAILURE,
  LOAD_ENTRIES_REQUEST,
  LOAD_ENTRIES_SUCCESS,
  LOAD_ENTRIES_FAILURE,
  SET_ENTRY_VALUE_REQUEST,
  SET_ENTRY_VALUE_SUCCESS,
  SET_ENTRY_VALUE_FAILURE,
  REMOVE_ENTRY_REQUEST,
  REMOVE_ENTRY_SUCCESS,
  REMOVE_ENTRY_FAILURE
} from '../actions/entries'

const defaultState = {
  creating: false,
  loading: false,
  removing: false,
  entriesByListId: {},
  listIds: [],
  listsById: {},
  updatingEntryValue: false,
  addingEntry: false,
  gettingListEntries: false,
  listEntriesError: {}
}

export default (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case LOCATION_CHANGE:
      const { path } = payload.location
      if (state.createdListId && path !== '/new-list') {
        return {
          ...state,
          createdListId: null,
          creating: false
        }
      }
      if (state.updatedListId && !/\/list\/.*\/edit/.test(path)) {
        return {
          ...state,
          updatedListId: null,
          updating: false
        }
      }
      return state
    case LOAD_LISTS_REQUEST:
      return {
        ...state,
        loading: true,
        loadingError: null
      }
    case LOAD_LISTS_SUCCESS:
      const listIds = []
      const listsById = {}
      payload.forEach(list => {
        listIds.push(list.listId)
        listsById[list.listId] = list
      })

      return {
        ...state,
        loading: false,
        loadingError: null,
        listIds,
        listsById
      }
    case LOAD_LISTS_FAILURE:
      return {
        ...state,
        loading: false,
        loadingError: error
      }
    case CREATE_LIST_REQUEST:
      return {
        ...state,
        creating: true,
        creationError: null,
        createdListId: null
      }
    case CREATE_LIST_SUCCESS:
      const { listId, name, description, category, createdAt } = payload
      return {
        ...state,
        listIds: [...state.listIds, listId],
        listsById: {
          ...state.listsById,
          [listId]: {
            listId,
            name,
            description,
            category,
            createdAt
          }
        },
        creating: false,
        creationError: null,
        createdListId: listId
      }
    case CREATE_LIST_FAILURE:
      return {
        ...state,
        creating: false,
        creationError: error
      }
    case UPDATE_LIST_REQUEST:
      return {
        ...state,
        updating: true,
        updatedListId: null,
        updateError: null
      }
    case UPDATE_LIST_SUCCESS: {
      const { listId } = meta
      return {
        ...state,
        listsById: {
          ...state.listsById,
          [listId]: {
            listId,
            ...payload
          }
        },
        updating: false,
        updatedListId: listId,
        updateError: null
      }
    }
    case UPDATE_LIST_FAILURE:
      return {
        ...state,
        updating: false,
        updatedListId: null,
        updateError: error
      }

    case REMOVE_LIST_REQUEST:
      return {
        ...state,
        removing: true,
        removalError: null
      }
    case REMOVE_LIST_SUCCESS:
      const deletedId = meta.listId
      const {
        // eslint-disable-next-line no-unused-vars
        [deletedId]: deletedList,
        ...restListsById
      } = state.listsById

      return {
        ...state,
        listIds: state.listIds.filter(listId => listId !== deletedId),
        listsById: restListsById,
        removing: false,
        removalError: null
      }
    case REMOVE_LIST_FAILURE:
      return {
        ...state,
        removing: false,
        removalError: error
      }
    case ADD_ENTRY_REQUEST:
      return {
        ...state,
        addEntryError: null,
        addingEntry: true
      }
    case ADD_ENTRY_SUCCESS:
      return {
        ...state,
        addingEntry: false,
        entriesByListId: {
          ...state.entriesByListId,
          [meta.listId]: [
            ...(state.entriesByListId[meta.listId] || []),
            {
              title: meta.title,
              ...payload
            }
          ]
        }
      }
    case ADD_ENTRY_FAILURE:
      return {
        ...state,
        addEntryError: error,
        addingEntry: false
      }

    case LOAD_ENTRIES_REQUEST:
      return {
        ...state,
        listEntriesError: null,
        gettingListEntries: true,
        fetchedListEntries: false
      }

    case LOAD_ENTRIES_SUCCESS:
      return {
        ...state,
        listEntriesError: null,
        gettingListEntries: false,
        fetchedListEntries: true,
        entriesByListId: {
          ...state.entriesByListId,
          [meta.listId]: Object.entries(payload).map(pair => ({
            entId: pair[0],
            ...pair[1]
          }))
        }
      }
    case LOAD_ENTRIES_FAILURE:
      return {
        ...state,
        listEntriesError: error,
        gettingListEntries: false,
        fetchedListEntries: false
      }
    case SET_ENTRY_VALUE_REQUEST:
      return {
        ...state,
        updatingEntryValue: true,
        entryValueUpdateError: null
      }
    case SET_ENTRY_VALUE_SUCCESS:
      const oldEntries = state.entriesByListId[meta.listId]
      const index = findIndex(oldEntries, { entId: meta.entry.entId })
      const updatedEntries = [...oldEntries]
      if (index > -1) {
        updatedEntries[index] = meta.entry
      }

      return {
        ...state,
        updatingEntryValue: false,
        entryValueUpdateError: null,
        entriesByListId: {
          ...state.entriesByListId,
          [meta.listId]: updatedEntries
        }
      }
    case SET_ENTRY_VALUE_FAILURE:
      return {
        ...state,
        updatingEntryValue: false,
        entryValueUpdateError: error
      }
    case REMOVE_ENTRY_REQUEST:
      return {
        ...state,
        removingEntry: false,
        removeEntryError: null
      }

    case REMOVE_ENTRY_SUCCESS: {
      const oldEntries = state.entriesByListId[meta.listId]
      const updatedEntries = oldEntries.filter(
        entry => entry.entId !== meta.entId
      )
      return {
        ...state,
        removingEntry: false,
        removeEntryError: null,
        entriesByListId: {
          ...state.entriesByListId,
          [meta.listId]: updatedEntries
        }
      }
    }
    case REMOVE_ENTRY_FAILURE:
      return {
        ...state,
        removingEntry: false,
        removeEntryError: error
      }

    default:
      return state
  }
}
