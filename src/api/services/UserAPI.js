import instance from '../axios';

export const UserAPI = {
    getAll: function () {
        return instance.request({
        url: `/users`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    get: function (id) {
        return instance.request({
        url: `/users/${id}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
