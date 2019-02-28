'use strict'

const modules = {
  moduleNames: ['frontend', 'backend', 'baseline'],
  precedence: {
    frontend: ['backend', 'baseline'],
    backend: ['baseline']
  },
  dependencies: {
    backend: ['baseline'],
    frontend: ['baseline']
  }
}

module.exports = modules
