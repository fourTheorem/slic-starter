import { LOCATION_CHANGE } from 'connected-react-router'

const appTitle = 'SLIC Starter'

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
  }
  return titles
}
