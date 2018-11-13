export const CREATE_LIST_REQUEST = 'CREATE_LIST_REQUEST'
export const CREATE_LIST_SUCCESS = 'CREATE_LIST_SUCCESS'
export const CREATE_LIST_FAILURE = 'CREATE_LIST_FAILURE'

export function createList({ name }) {
  return function(dispatch) {
    dispatch({ type: CREATE_LIST_REQUEST })
    dispatch({ type: CREATE_LIST_FAILURE })
  }
}
