/**
 * Common artifacts for build specs requiring module-specific output
 */
export default {
  files: [
    '*.yml',
    '*.json',
    '*.js',
    'build-scripts/**/*',
    `node_modules/**/*`,
    `*/*.yml`,
    `*/*.js`,
    `*/node_modules/**/*`,
    `*/package.json`,
    `*/package-lock.json`,
    `*/build-artifacts/**/*`,
    `*/build/**/*`
  ]
}
