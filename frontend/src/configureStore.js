import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import { apiMiddleware } from 'redux-api-middleware'
import { routerMiddleware } from 'connected-react-router'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createLogger } from 'redux-logger'

import reducers from './reducers'

const composeEnhancers = composeWithDevTools({})

// Log redux actions relating to errors and failures
const logger = createLogger({
  predicate: (getState, action) =>
    action.type.endsWith('FAILURE') || action.error,
})

const store = (history) =>
  createStore(
    reducers(history),
    composeEnhancers(
      applyMiddleware(
        apiMiddleware,
        thunkMiddleware,
        routerMiddleware(history),
        logger
      )
    )
  )

export default store
