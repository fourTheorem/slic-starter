import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import app from './app'
import auth from './auth'
import checklists from './checklists'

const reducer = (history) =>
  combineReducers({
    app,
    auth,
    checklists,
    router: connectRouter(history),
  })

export default reducer
