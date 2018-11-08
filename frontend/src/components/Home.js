import React, { Component } from 'react'

import NavigationBar from './NavigationBar'
import Lists from './Lists'

export default class Home extends Component {
  render() {
    return (
      <div>
        <NavigationBar />
        <h1>Home</h1>
        <Lists />
      </div>
    )
  }
}
