/**
 * Common artifacts for build specs requiring module-specific output
 */
export default (moduleName: string) => ({
  files: [
    '*.yml',
    '*.json',
    '*.js',
    'build-scripts/**/*',
    ...moduleArtefacts(moduleName),
    ...moduleArtefacts('slic-tools')
  ]
})

function moduleArtefacts(moduleName: string) {
  return [
    `${moduleName}/*.yml`,
    `${moduleName}/*.js`,
    `${moduleName}/node_modules/**/*`,
    `${moduleName}/package.json`,
    `${moduleName}/package-lock.json`,
    `${moduleName}/build-artifacts/**/*`,
    `${moduleName}/build/**/*`
  ]
}
