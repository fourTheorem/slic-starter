/* eslint-disable no-template-curly-in-string */
const siteDomainName = process.env.SLIC_NS_DOMAIN
  ? '${self:custom.domainPrefixes.${self:provider.stage}}${env:SLIC_NS_DOMAIN}'
  : ''
const bucketName = `slic-starter-site-assets-${
  siteDomainName
    ? siteDomainName
    : process.env.SITE_BUCKET_PREFIX + '-${self:provider.stage}'
}`

module.exports = () =>
  require('yamljs').parse(`

bucketName: ${bucketName}
domainPrefixes: $\{file(../common-config.json):domainPrefixes}
s3Sync:
  - bucketName: $\{self:custom.bucketName}
    localDir: build
# The HostedZoneId for CloudFront distributions is always this value.
# See http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-route53-aliastarget.html
# AND http://docs.aws.amazon.com/general/latest/gr/rande.html
cloudFrontHostedZoneId: Z2FDTNDATAQYW2
siteConfig: $\{file(./site-config.js)}

`)
