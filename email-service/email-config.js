'use strict'

module.exports = {
  fromAddress: () => {
    const stage = process.env.SLIC_STAGE
    const domainPrefix = stage === 'prod' ? '' : `${stage}.`
    return (
      (process.env.SLIC_NS_DOMAIN &&
        `noreply@${domainPrefix}${process.env.SLIC_NS_DOMAIN}`) ||
      'noreply@example.com'
    )
  }
}
