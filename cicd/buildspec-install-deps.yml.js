module.exports = () => `
version: 0.2

phases:
  build:
    commands:
      - aws sts get-caller-identity
      - cd backend
      - npm install
      - cd ../frontend
      - npm install
artifacts:
    files:
        - '**/*'
`
