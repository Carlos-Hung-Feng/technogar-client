import { instance } from './axios';

export const AuthAPI = {
    login: function (credentials) {
        return instance.request({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
        })
        .then(response => {
        const { token } = response.data;
        if (token) {
            localStorage.setItem('token', token);
        }
        return response.data;
        })
        .catch(error => { throw error; });
    },
    logout: function () {
        localStorage.removeItem('token');
        return instance.request({
        url: '/auth/logout',
        method: 'POST',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
};
