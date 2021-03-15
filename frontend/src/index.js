import React from 'react'
import { render } from 'react-dom'
import { Amplify } from '@aws-amplify/core'
import { createBrowserHistory } from 'history'

import './index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import configureStore from './configureStore'
import amplifyConfig from './amplifyConfig'

Amplify.configure(amplifyConfig)

const history = createBrowserHistory()
const store = configureStore(history)

render(<App store={store} history={history} />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
