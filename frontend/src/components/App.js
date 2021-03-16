import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { CssBaseline } from '@material-ui/core'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import Root from './Root'

class App extends Component {
  render() {
    const { history, store } = this.props

    const theme = createMuiTheme({
      typography: {
        useNextVariants: true,
      },
      palette: {
        /* https://material.io/tools/color/#!/?view.left=0&view.right=1&primary.color=1A237E&secondary.color=D81B60 */
        primary: {
          light: '#534bae',
          main: '#1a237e',
          dark: '#000051',
          contrastText: '#fff',
        },
        secondary: {
          light: '#ff5c8d',
          main: '#d81b60',
          dark: '#a00037',
          contrastText: '#fff',
        },
      },
    })

    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Root />
          </MuiThemeProvider>
        </ConnectedRouter>
      </Provider>
    )
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
}

export default App
