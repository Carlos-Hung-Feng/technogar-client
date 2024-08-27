import instance from '../axios';

export const PaymentMethodAPI = {
    getAll: function () {
        return instance.request({
        url: `/payment-methods`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    get: function (id) {
        return instance.request({
        url: `/payment-methods/${id}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
