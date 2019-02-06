module.exports = () => `
version: 0.2

phases:
  build:
    commands:
      - cd backend
      - npm install
      - cd ../frontend
      - npm install
artifacts:
    files:
        - '**/*'
`
