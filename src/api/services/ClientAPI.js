import instance from '../axios';

export const ClientAPI = {
    getAll: function () {
        return instance.request({
        url: `/customers`,
        method: 'GET',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    getClientByIdentifier: function (_identifier) {
        return instance.request({
        url: `/customers?filters[Identifier][$eq]=${_identifier}&populate[Product_Preferences][fields][0]=id&populate[Payment_Method][fields][0]=id`,
        method: 'GET',
        })
        .then(response => {
            let client = response.data.data[0]
            const data = {
                id: client.id,
                fullName: client.attributes.FullName,
                email: client.attributes.Email,
                telephone: client.attributes.Telephone,
                address: client.attributes.Address,
                productPreferences: client.attributes.Product_Preferences.data[0].id,
                paymentMethod: client.attributes.Payment_Method.data.id,
                identifier: client.attributes.Identifier,
                lastPurchaseDate: client.attributes.LastPurchaseDate,
                note: client.attributes.Note,
                customerType: client.attributes.CustomerType,
                links: client.attributes.Links
            };
            return data;
        })
        .catch(error => { throw error; });
    },
    create: function(_data) {
        let data = {
            'data': {
                "FullName": _data.fullName,
                "Email": _data.email,
                "Telephone": _data.telephone,
                "Address": _data.address,
                "Identifier": _data.identifier,
                "LastPurchaseDate": _data.lastPurchaseDate,
                "Note": _data.note,
                "CustomerType": _data.customerType,
                "Active": true,
                "Links": _data.links,
                "Product_Preferences": {
                    "id": _data.productPreferences
                },
                "Payment_Method": {
                    "id": _data.paymentMethod
                }
            }
        }
        return instance.request({
            url: `/customers`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    update: function(_data) {
        let data = {
            'data': {
                "FullName": _data.fullName,
                "Email": _data.email,
                "Telephone": _data.telephone,
                "Address": _data.address,
                "Identifier": _data.identifier,
                "LastPurchaseDate": _data.lastPurchaseDate,
                "Note": _data.note,
                "CustomerType": _data.customerType,
                "Active": true,
                "Links": _data.links,
                "Product_Preferences": {
                    "id": _data.productPreferences
                },
                "Payment_Method": {
                    "id": _data.paymentMethod
                }
            }
        }
        return instance.request({
            url: `/customers/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
