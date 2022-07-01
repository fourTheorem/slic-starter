const axios = require('axios');
const { toneAxiosError } = require('./axios-util');
const { loadBackendConfig } = require('./backend-config');
const { getUser } = require('./user-util');

async function getHttpClient(apiName = 'checklist-service') {
  const { apiEndpoints } = await loadBackendConfig();
  const { idToken } = await getUser();

  const headers = { Authorization: idToken };

  const axiosClient = axios.create({
    baseURL: apiEndpoints[apiName],
    headers,
  });

  axiosClient.interceptors.request.use(
    (config) => config,
    (error) => toneAxiosError(error)
  );

  axiosClient.interceptors.response.use(
    (config) => config,
    (error) => toneAxiosError(error)
  );
  return axiosClient;
}

const httpClientPromise = getHttpClient();

const proxy = new Proxy(
  {},
  {
    get: (target, name, ...args) =>
      function proxyRequest() {
        return httpClientPromise.then((axiosClient) =>
          axiosClient[name](...args)
        );
      },
  }
);

module.exports = proxy;
