import { Auth as AmplifyAuth } from 'aws-amplify'
import SimulatedAuth from 'mock-amplify-auth'
import { simulatedAuth } from './mode'

export const Auth = simulatedAuth ? SimulatedAuth : AmplifyAuth
