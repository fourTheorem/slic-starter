'use strict'

import tsort from 'tsort'

const modules = {
  moduleNames: ['frontend', 'backend', 'baseline'],
  dependencies: {
    backend: ['baseline'],
    frontend: ['baseline']
  }
}

// Turn dependencies into an optimal deploy order of stages
const graph = tsort()
Object.entries(modules.dependencies).forEach(([key, deps]) => {
  deps.forEach(dep => graph.add(dep, key))
})
const order = graph.sort()

const stages = []
let stage = []

while (order.length) {
  const mod = order.shift()
  stage.push(mod)
  const deps = (order.length && modules.dependencies[order[0]]) || []
  if (deps.indexOf(mod) > -1) {
    stages.push(stage)
    stage = []
  }
}
if (stage.length) {
  stages.push(stage)
}

const deployOrder = {}
stages.forEach((stage, index) => {
  stage.forEach(mod => {
    deployOrder[mod] = index + 1
  })
})

export default {
  ...modules,
  deployOrder,
  stages
}
