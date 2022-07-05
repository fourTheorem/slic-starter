import axios from 'axios';
import { toneAxiosError } from './axios-util.js';
import { loadBackendConfig } from './backend-config.js';
import { getUser } from './user-util.js';

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

export const httpClient = new Proxy(
  {},
  {
    get: (target, name) =>
      function proxyRequest(...args) {
        return httpClientPromise.then((axiosClient) =>
          axiosClient[name](...args)
        );
      },
  }
);
