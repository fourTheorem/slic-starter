'use strict'

const { URL } = require('url')
const aws4 = require('aws4')
const axios = require('axios')
const { toneAxiosError } = require('./axios-util')
const { loadBackendConfig } = require('./backend-config')
const { getUser } = require('./user-util')

const stage = process.env.SLIC_STAGE || 'local'

const signHttpRequest = config => {
  const url = `${config.baseURL || ''}${config.url || ''}`
  const { hostname: host, pathname: path } = new URL(url)

  const opts = { host, path }
  aws4.sign(opts)

  config.headers = config.headers || {}
  Object.assign(config.headers, {
    Host: opts.headers['Host'],
    'X-Amz-Date': opts.headers['X-Amz-Date'],
    Authorization: opts.headers['Authorization']
  })

  if (opts.headers['X-Amz-Security-Token']) {
    config.headers['X-Amz-Security-Token'] =
      opts.headers['X-Amz-Security-Token']
  }
}

async function interceptRequest(config) {
  console.log('interceptRequest', config)
  return Promise.resolve(config)
}

async function getHttpClient() {
  const { apiEndpoint } = await loadBackendConfig()
  const { idToken, userId } = await getUser()

  const headers =
    stage === 'local'
      ? {
          'cognito-identity-id': userId
        }
      : {
          Authorization: idToken
        }

  const axiosClient = axios.create({
    baseURL: apiEndpoint,
    headers
  })

  axiosClient.interceptors.request.use(interceptRequest, error => {
    return Promise.reject(toneAxiosError(error))
  })

  axiosClient.interceptors.response.use(
    config => config,
    error => {
      return Promise.reject(toneAxiosError(error))
    }
  )
  return axiosClient
}

let httpClientPromise = getHttpClient()

const proxy = new Proxy(
  {},
  {
    get: (target, name) => {
      return function proxyRequest() {
        const requestArgs = arguments
        return httpClientPromise.then(axiosClient => {
          return axiosClient[name].apply(axiosClient, requestArgs)
        })
      }
    }
  }
)

module.exports = proxy
