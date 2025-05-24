import Axios from 'axios';

const axios = Axios.create({
  baseURL: process.env.VUE_APP_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axios;
