const axios = require('axios')
const { rword } = require('rword')
const { toneAxiosError } = require('./lib/axios-util')

const stage = process.env.SLIC_STAGE || 'local'

let user
let config

async function getConfig() {
  if (!config) {
    const axiosClient = await getAxiosClient()
    const user = await getUser()
    config = { axiosClient, user }
  }

  return config
}

async function getAxiosClient() {
  const baseUrl = await getBaseUrl()
  const { userId } = await getUser()

  const headers =
    stage === 'local'
      ? {
          'cognito-identity-id': userId
        }
      : undefined

  const axiosClient = axios.create({
    baseURL: baseUrl,
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

async function getUser() {
  if (!user) {
    if (stage === 'local') {
      const userId = rword.generate(3).join('-')
      const email = `${userId}@example.com`
      user = {
        email,
        userId
      }
    } else {
      throw new Error('TODO - Retrieval of cognito userId not implemented')
    }
  }
  return user
}

async function getBaseUrl() {
  if (stage === 'local') {
    return 'http://localhost:4000'
  } else {
    throw new Error('TODO - Retrieval of backend URL not implemented')
  }
}

module.exports = getConfig
