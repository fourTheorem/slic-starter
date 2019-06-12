let config
try {
  config = require('../slic-config.json')
} catch (err) {
  throw new Error('SLIC must be configured in slic-config.json first. Copy slic-config.json.sample to get started!')
}

export default {
  region: config.deployment.region,
  nsDomain: config.deployment.nsDomain,
  runtime: 'nodejs:8.10',
  sourceRepoOwner: config.sourceRepo.owner,
  sourceRepoName: config.sourceRepo.name,
  sourceBranch: config.sourceRepo.branch,
  accountIds: config.accountIds
}
