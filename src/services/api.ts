import axios, { AxiosError } from 'axios';
import log from '@/utils/log';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string;

const publicRouter = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

publicRouter.interceptors.response.use(
  (value) => Promise.resolve(value),
  (error) => {
    if (error instanceof AxiosError) {
      log.debug(`Error in API call: ${JSON.stringify(error, null, 2)}`);
      log.debug(`Error in API ${JSON.stringify(error.request, null, 2)}`);
    }
    return Promise.reject(error as Error);
  },
);

const api = { public: publicRouter };

export default api;
