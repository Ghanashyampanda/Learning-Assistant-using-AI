import axios from 'axios';
import { BASE_URL } from './apiPaths.js';

const axioInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

//request interceptor 
axioInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Response Interceptor
axioInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401 && !error.config.url.includes('/auth/login')) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login page
                window.location.href = '/login';
            } else if (error.response.status === 500) {
                console.error('Server error.Please try again later.');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout. Please try again later.');
        }
        return Promise.reject(error);
    }
);

export default axioInstance;