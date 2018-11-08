const defaultState = {
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
    default:
      return state
  }
}
