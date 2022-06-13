/* eslint-disable no-template-curly-in-string */
module.exports = async ({ options, resolveVariable }) => {
  const stage = await resolveVariable('sls:stage')
  const domainConfig = await resolveVariable('file(../app.yml):domainConfig')
  const { nsDomain } = domainConfig
  const siteDomainName = nsDomain && domainConfig.domainPrefixes[stage] + nsDomain
  if (!nsDomain && !domainConfig.siteBucketPrefix) {
    throw new Error(
      'Either nsDomain or siteBucketPrefix must be specified in app.yml'
    )
  }

  const bucketName = siteDomainName
    ? `slic-starter-site-assets-${siteDomainName}`
    : `${domainConfig.siteBucketPrefix}-${stage}`

  // The certificate ARN and Route53 HostedZone for custom domain deployments require deployment in us-east-1
  // The only way to look these up conveniently is to use Serverless Framework cross-region `cf` variables
  // This will fail to resolve if the deployment is not using custom domains, so we use JS to avoid them in that case.
  const siteCertificateArn = nsDomain && await resolveVariable(`cf(us-east-1):certs-${stage}.siteCert`)
  const distributionViewerCertificate = siteCertificateArn
    ? {
        AcmCertificateArn: siteCertificateArn,
        SslSupportMethod: 'sni-only'
      }
    : {
        CloudFrontDefaultCertificate: true
      }
  const siteHostedZone = nsDomain && await resolveVariable(`cf(us-east-1):certs-${stage}.publicHostedZone`)

  return {
    bucketName,
    siteDomainName,
    distributionViewerCertificate,
    siteHostedZone
  }
}
