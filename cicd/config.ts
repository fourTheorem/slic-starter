let accountIds
try {
  accountIds = require('../aws-accounts.json')
} catch (err) {
  throw new Error('AWS account IDs must be configured in aws-accounts.json first. Copy aws-accounts.json.sample to get started!')
}

export default {
  stage: process.env.SLIC_STAGE || 'dev',
  region: 'eu-west-1',
  runtime: 'nodejs:8.10',
  sourceRepoOwner: 'fourTheorem',
  sourceRepoName: 'slic-starter',
  sourceBranch: 'feature/advanced-cicd-#19', // TODO - change this to master
  accountIds
}
