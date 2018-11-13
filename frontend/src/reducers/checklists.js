import {
  CREATE_LIST_REQUEST,
  CREATE_LIST_SUCCESS,
  CREATE_LIST_FAILURE
} from '../actions/checklists'

const defaultState = {
  creating: false,
  listIds: ['a', 'b'],
  listsById: {
    a: {
      name: 'List A'
    },
    b: {
      name: 'List B'
    }
  }
}

export default (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case CREATE_LIST_REQUEST:
      return {
        ...state,
        creating: true,
        creationError: null
      }
    case CREATE_LIST_SUCCESS:
      return {
        ...state,
        creating: false,
        creationError: null
      }
    case CREATE_LIST_FAILURE:
      return {
        ...state,
        creating: false,
        creationError: error
      }
    default:
      return state
  }
}
