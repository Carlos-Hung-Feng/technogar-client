import instance from '../axios';

export const InvoiceDiscountAPI = {
    getAll: function () {
        return instance.request({
        url: `/invoice-discounts`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    get: function (id) {
        return instance.request({
        url: `/invoice-discounts/${id}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
