import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import Root from './Root'

class App extends Component {
  render() {
    const { history, store } = this.props

    const theme = createMuiTheme({
      typography: {
        useNextVariants: true
      },
      palette: {
        type: 'light'
      }
    })

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider theme={theme}>
            <Root />
          </MuiThemeProvider>
        </ConnectedRouter>
      </Provider>
    )
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
}

export default App
