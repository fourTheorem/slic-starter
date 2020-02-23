'use strict'

const stage = process.env.SLIC_STAGE
const domainPrefix = stage === 'prod' ? '' : `${stage}.`

module.exports = () => ({
  apiDomainName: `api.${domainPrefix}${process.env.SLIC_NS_DOMAIN}`
})
