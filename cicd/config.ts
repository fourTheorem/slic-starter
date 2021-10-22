let customConfig
try {
  customConfig = require('../slic-config.json')
} catch (err) {
  console.log(err)
  throw new Error(
    `SLIC must be configured in slic-config.json first.  Copy slic-config.json.sample to get started!`)
}

export default {
  nsDomain: customConfig.domainConfig.nsDomain,
  runtime: 'nodejs14.x',
  sourceRepoOwner: customConfig.sourceRepo.owner,
  sourceRepoName: customConfig.sourceRepo.name,
  sourceBranch: customConfig.sourceRepo.branch,
  siteBucketPrefix: customConfig.domainConfig.siteBucketPrefix
}
