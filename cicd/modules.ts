export interface Modules {
  moduleNames: string[]
}
let modules
if (process.env.SLIC_NS_DOMAIN) {
  modules: Modules = {
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
} else {
  modules: Modules = {
    moduleNames: [
      'api-service',
      'frontend',
      'logging',
      'checklist-service',
      'user-service',
      'email-service',
      'welcome-service',
      'sharing-service'
    ]
  }
}

export default modules
