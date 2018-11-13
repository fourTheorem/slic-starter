import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import app from './app'
import auth from './auth'
import checklists from './checklists'

export default history =>
  combineReducers({
    app,
    auth,
    checklists,
    router: connectRouter(history)
  })
