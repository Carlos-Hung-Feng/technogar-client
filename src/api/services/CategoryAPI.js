import instance from '../axios';

export const CategoryAPI = {
    getAll: function () {
        return instance.request({
        url: `/categories`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    get: function (id) {
        return instance.request({
        url: `/categories/${id}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
