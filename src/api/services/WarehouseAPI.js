import instance from '../axios';

export const WarehouseAPI = {
    getAll: function () {
        return instance.request({
        url: `/warehouses`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    get: function (id) {
        return instance.request({
        url: `/warehouses/${id}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    getByWarehouseIdAndProductId: function (_warehouseId, _productId) {
        return instance.request({
        url: `/warehouse-inventories?fields[0]=Quantity&populate[Warehouse][fields][0]=id&populate[Product][fields][0]=id&filters[Warehouse][id][$eq]=${_warehouseId}&filters[Product][id][$eq]=${_productId}`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    create: function(_data) {
        let data = {
            'data': {
                "Quantity": _data.quantity,
                "Warehouse": {
                    "id": _data.warehouse
                },
                "Product": {
                    "id": _data.product
                }
            }
        }
        return instance.request({
            url: `/warehouse-inventories`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    update: function(_data) {
        console.log(_data);
        let data = {
            'data': {
                "Quantity": _data.quantity,
                "Warehouse": {
                    "id": _data.warehouse
                },
                "Product": {
                    "id": _data.product
                }
            }
        }
        return instance.request({
            url: `/warehouse-inventories/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
