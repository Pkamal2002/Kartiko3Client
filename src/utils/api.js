import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('kartiko_user');
    if (storedUser) {
        const { token } = JSON.parse(storedUser);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
