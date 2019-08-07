export interface Modules {
  moduleNames: string[]
}

const modules: Modules = {
  moduleNames: [
    'api-service',
    'frontend',
    'certs',
    'logging',
    'checklist-service',
    'user-service',
    'email-service',
    'welcome-service',
    'sharing-service'
  ]
}

export default modules
