import config from './config'
const { nsDomain } = config

export interface Modules {
  moduleOrder: string[][]
}


const nsModules =  [['certs'], ['api-service']] // Only used in domain and HTTPS cert is required

const standardModules = [
  ['user-service'],
  ['checklist-service', 'email-service', 'welcome-service', 'sharing-service'],
  ['frontend']
]

const moduleOrder = [
  ...(nsDomain ? nsModules : []),
  ...standardModules
]

const modules: Modules = {
  moduleOrder
}

export default modules
