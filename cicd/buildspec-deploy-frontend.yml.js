module.exports = () =>
  require('./buildspec-common.yml.js')(`
      - echo Building frontend
      - cd frontend
      - npm run build
      - serverless deploy
`)
