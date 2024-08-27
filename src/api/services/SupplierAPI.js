import instance from '../axios';

export const SupplierAPI = {
    getAll: function () {
        return instance.request({
        url: `/suppliers`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    get: function (id) {
        return instance.request({
        url: `/suppliers/${id}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
