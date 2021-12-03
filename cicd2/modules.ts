const { nsDomain } = require('./config')

export interface Modules {
  moduleNames: string[]
}

const moduleNames = [
  'frontend',
  'checklist-service',
  'user-service',
  'email-service',
  'welcome-service',
  'sharing-service',
  ...(nsDomain ? ['certs', 'api-service'] : [])
]

const modules: Modules = {
  moduleNames
}

export default modules
