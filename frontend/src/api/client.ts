import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

client.interceptors.request.use(async config => {
  if (!document.cookie.includes('XSRF-TOKEN')) {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
  }
  return config;
});

export default client;
