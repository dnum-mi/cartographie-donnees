import axios from 'axios';


const ACCESS_TOKEN = "ACCESS_TOKEN";

export function login(access_token) {
    localStorage.setItem(ACCESS_TOKEN, access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
}

export function logout() {
    localStorage.removeItem(ACCESS_TOKEN);
    delete axios.defaults.headers.common['Authorization'];
}

const accessToken = localStorage.getItem(ACCESS_TOKEN);
if (accessToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

axios.interceptors.response.use((res) => {
    return Promise.resolve(res);
}, (error) => {
    if (error && error.response && error.response.status === 401) {
        // Two exceptions
        if (!error.response.config.url.includes('/api/login') &&
            !error.response.config.url.includes('/api/users/me')) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
})
