import { Auth as AmplifyAuth } from 'aws-amplify'
import { simulatedAuth } from './mode'

export let Auth

if (simulatedAuth) {
  console.log('Using simulated authentication')

  function timerPromise(ms, reject = false) {
    return new Promise((resolve, reject) =>
      setTimeout(() => (reject ? reject : resolve)(), ms)
    )
  }

  const authState = {}
  Auth = {
    signUp: ({ email }) => {
      Object.assign(authState, { email, loggedIn: false })
      return timerPromise(1200)
    },
    signIn: ({ email }) => {
      Object.assign(authState, { email, loggedIn: true })
      return timerPromise(700)
    },
    currentSession: () => {
      return new Promise((resolve, reject) => {
        return timerPromise(400, !authState.loggedIn)
      })
    },
    confirmSignUp: () => {
      return timerPromise(400)
    },
    signOut: () => {
      Object.assign(authState, { email: null, loggedIn: false })
      return timerPromise(100)
    },
    resendSignUp: () => {
      return timerPromise(100)
    }
  }
} else {
  Auth = AmplifyAuth
}
