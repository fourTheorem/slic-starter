'use strict'

const { domainConfig } = require('./slic-config.json')

module.exports = async ({ resolveVariable }) => {
  const stage = await resolveVariable('sls:stage')
  const domainPrefix = stage === 'prod' ? '' : `${stage}.`
  return {
    apiDomainName: `api.${domainPrefix}${domainConfig.nsDomain}`
  }
}
