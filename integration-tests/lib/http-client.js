'use strict'

const axios = require('axios')
const { toneAxiosError } = require('./axios-util')
const { loadBackendConfig } = require('./backend-config')
const { getUser } = require('./user-util')

async function getHttpClient(apiName = 'checklist-service') {
  const { apiEndpoints } = await loadBackendConfig()
  const { idToken } = await getUser()

  const headers = { Authorization: idToken }

  const axiosClient = axios.create({
    baseURL: apiEndpoints[apiName],
    headers
  })

  axiosClient.interceptors.request.use(
    config => config,
    error => {
      return Promise.reject(toneAxiosError(error))
    }
  )

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
