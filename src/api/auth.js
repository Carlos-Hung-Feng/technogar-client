import instance from './axios';

export const AuthAPI = {
    login: function (credentials) {
        return instance.request({
        url: '/auth/local',
        method: 'POST',
        data: credentials,
        })
        .then(response => {
        const token  = response.data.jwt;
        const userId  = response.data.user.id;
        if (token) {
            localStorage.setItem('token', token);
        }
        if (userId) {
            localStorage.setItem('userId', userId);
        }
        return response.data;
        })
        .catch(error => { throw error; });
    },
    logout: function () {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // return instance.request({
        // url: '/auth/logout',
        // method: 'POST',
        // })
        // .then(response => response.data)
        // .catch(error => { throw error; });
    },
};
