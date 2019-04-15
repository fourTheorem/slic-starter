// @ts-ignore
import tsort = require('tsort')

export interface Modules {
  stages: Array<string[]>
  deployOrder: {
    [moduleName: string]: number
  }
  moduleNames: string[]
  dependencies: {
    [moduleName: string]: string[]
  }
}

const modules: Modules = {
  moduleNames: ['frontend', 'backend', 'baseline'],
  dependencies: {
    backend: ['baseline'],
    frontend: ['baseline']
  },
  stages: [],
  deployOrder: {}
}
export default modules

// Turn dependencies into an optimal deploy order of stages
const graph = tsort()
Object.entries(modules.dependencies).forEach(([key, deps]) => {
  deps.forEach(dep => graph.add(dep, key))
})
const order = graph.sort()

modules.stages = []
let stage = []

while (order.length) {
  const mod = order.shift()
  stage.push(mod)
  const deps = (order.length && modules.dependencies[order[0]]) || []
  if (deps.indexOf(mod) > -1) {
    modules.stages.push(stage)
    stage = []
  }
}
if (stage.length) {
  modules.stages.push(stage)
}

modules.stages.forEach((stage, index) => {
  stage.forEach(mod => {
    modules.deployOrder[mod] = index + 1
  })
})
