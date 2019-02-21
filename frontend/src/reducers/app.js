import { LOCATION_CHANGE } from 'connected-react-router'

const appTitle = 'SLIC Lists'

const defaultState = {
  titles: [appTitle]
}

export default (state = defaultState, { type, meta, payload, error }) => {
  switch (type) {
    case LOCATION_CHANGE:
      return {
        ...state,
        titles: pathToTitles(payload.location.pathname)
      }
    default:
      return state
  }
}

function pathToTitles(path) {
  const titles = [appTitle]
  if (path === '/new-list') {
    titles.push('New List')
  } else if (path.startsWith('/list/')) {
    titles.push('List')
  }
  return titles
}
