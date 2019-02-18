import {
  LOAD_LISTS_REQUEST,
  LOAD_LISTS_SUCCESS,
  LOAD_LISTS_FAILURE,
  CREATE_LIST_REQUEST,
  CREATE_LIST_SUCCESS,
  CREATE_LIST_FAILURE,
  REMOVE_LIST_REQUEST,
  REMOVE_LIST_SUCCESS,
  REMOVE_LIST_FAILURE,
  PREPARE_NEW_LIST
} from '../actions/checklists'

const defaultState = {
  creating: false,
  loading: false,
  removing: false,
  listIds: [],
  listsById: {}
}

export default (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case PREPARE_NEW_LIST:
      return {
        ...state,
        createdListId: null,
        creating: false
      }
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
      const { listId, name, createdAt } = payload
      return {
        ...state,
        listIds: [...state.listIds, listId],
        listsById: {
          ...state.listsById,
          [listId]: {
            listId,
            name,
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
    default:
      return state
  }
}
