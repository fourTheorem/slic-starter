module.exports = () =>
  require('./buildspec-common.yml.js')(`
      - echo Building backend
      - cd backend
      - serverless deploy
`)
