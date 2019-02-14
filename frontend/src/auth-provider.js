import { Auth as AmplifyAuth } from 'aws-amplify'
import { simulatedAuth } from './mode'

export let Auth

if (simulatedAuth) {
  console.log('Using simulated authentication')

  const authState = {}
  Auth = {
    signUp: ({ email }) => {
      Object.assign(authState, { email, loggedIn: false })
      return new Promise(resolve => setTimeout(() => resolve(), 1200))
    },
    signIn: ({ email }) => {
      Object.assign(authState, { email, loggedIn: true })
      return new Promise(resolve => setTimeout(() => resolve(), 700))
    },
    currentSession: () => {
      return new Promise((resolve, reject) => {
        const handler = authState.loggedIn ? resolve : reject
        setTimeout(() => handler(), 400)
      })
    },
    signOut: () => {
      Object.assign(authState, { email: null, loggedIn: false })
      return Promise.resolve()
    }
  }
} else {
  Auth = AmplifyAuth
}
