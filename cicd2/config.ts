export default {
  stage: process.env.SLIC_STAGE || 'dev',
  region: 'eu-west-1',
  runtime: 'nodejs:8.10',
  sourceRepoOwner: 'fourTheorem',
  sourceRepoName: 'slic-starter',
  accountIds: {
    cicd: 285982925560,
    dev: 935672627075
  }
}
