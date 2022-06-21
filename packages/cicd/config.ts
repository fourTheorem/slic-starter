import fs from 'node:fs'
import path from 'node:path'
import { load } from 'js-yaml'

let appConfig
try {
  appConfig = load(fs.readFileSync(path.resolve( '../../', 'app.yml'), 'utf8')) as Record<string, any>
} catch (err) {
  console.log(err)
  throw new Error('The application must be configured in app.yml')
}

export default {
  nsDomain: appConfig.domainConfig.nsDomain,
  runtime: 'nodejs16.x',
  sourceRepoOwner: appConfig.sourceRepo.owner,
  sourceRepoName: appConfig.sourceRepo.name,
  sourceBranch: appConfig.sourceRepo.branch,
  siteBucketPrefix: appConfig.domainConfig.siteBucketPrefix,
  appName: appConfig.sourceRepo.name
}
