import axios from 'axios';

// Dynamically determine API URL based on environment or current host
const getApiUrl = () => {
    // Check if there's an environment variable set (for production)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // For development, use current hostname but port 5000
    const hostname = window.location.hostname;
    return `http://${hostname}:5000/api`;
};

const api = axios.create({
    baseURL: getApiUrl(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
