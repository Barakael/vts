import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

client.defaults.xsrfCookieName = 'XSRF-TOKEN';
client.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

export default client;
