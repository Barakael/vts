import axios from 'axios';

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return null;
};

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

// Request interceptor to add CSRF token
client.interceptors.request.use((config) => {
  const token = getCsrfToken();
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    console.log('Added CSRF token to request:', config.url);
  } else {
    console.warn('No CSRF token found for request:', config.url);
  }
  return config;
});

client.defaults.xsrfCookieName = 'XSRF-TOKEN';
client.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

export default client;
