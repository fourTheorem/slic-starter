const proxy = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    proxy('/checklist', {
      target: 'http://localhost:4000',
      pathRewrite: { '^/checklist': '/local' },
    })
  )
  app.use(
    proxy('/share', {
      target: 'http://localhost:4006',
      pathRewrite: { '^/share': '/local' },
    })
  )
}
