'use strict'

module.exports = {
  apiDomainName: () => {
    const stage = process.env.SLIC_STAGE
    const domainPrefix = stage === 'prod' ? '' : `${stage}.`
    return `api.${domainPrefix}${process.env.SLIC_NS_DOMAIN}`
  }
}
