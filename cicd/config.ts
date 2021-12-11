const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

let appConfig
try {
  appConfig = yaml.load(fs.readFileSync(path.resolve(__dirname, '..', 'app.yml'), 'utf8'));
} catch (err) {
  console.log(err)
  throw new Error(`The application must be configured in app.yml`)
}

export default {
  nsDomain: appConfig.domainConfig.nsDomain,
  runtime: 'nodejs14.x',
  sourceRepoOwner: appConfig.sourceRepo.owner,
  sourceRepoName: appConfig.sourceRepo.name,
  sourceBranch: appConfig.sourceRepo.branch,
  siteBucketPrefix: appConfig.domainConfig.siteBucketPrefix,
  appName: appConfig.sourceRepo.name
}
