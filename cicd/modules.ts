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
  ...(process.env.SLIC_NS_DOMAIN ? ['certs', 'api-service'] : [])
]

const modules: Modules = {
  moduleNames
}

export default modules
