/* eslint-disable no-template-curly-in-string */
module.exports = async ({ options, resolveVariable }) => {
  const stage = await resolveVariable('sls:stage')

  const { domainConfig: { domainPrefixes, nsDomain, siteBucketPrefix } } = require('../slic-config.json')

  if (!nsDomain && !siteBucketPrefix) {
    throw new Error(
      'Either nsDomain or siteBucketPrefix must be specified in slic-config.json'
    )
  }
  const siteDomainName = nsDomain && `${domainPrefixes[stage]}${nsDomain}`
  const bucketName = siteDomainName
    ? `slic-starter-site-assets-${siteDomainName}`
    : `${siteBucketPrefix}-${stage}`

  const custom = {
    bucketName,
    domainPrefixes,
    s3Sync: [{ bucketName, localDir: 'build' }]
  }

  if (nsDomain) {
    custom.siteDomainName = siteDomainName
    /*
     The HostedZoneId for CloudFront distributions is always this value.
     See http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-route53-aliastarget.html
     AND http://docs.aws.amazon.com/general/latest/gr/rande.html
     */
    custom.cloudFrontHostedZoneId = 'Z2FDTNDATAQYW2'
  }
  return custom
}
