import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import auth from './auth'
import checklists from './checklists'

export default history =>
  combineReducers({
    auth,
    checklists,
    router: connectRouter(history)
  })
