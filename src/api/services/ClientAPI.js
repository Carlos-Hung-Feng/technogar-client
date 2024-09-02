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
            if (client === undefined)
                return undefined;
            
            const data = {
                id: client.id,
                fullName: client.attributes.FullName,
                email: client.attributes.Email,
                telephone: client.attributes.Telephone,
                address: client.attributes.Address,
                productPreferences: client.attributes.Product_Preferences.data.length > 0 ? client.attributes.Product_Preferences.data[0].id : "",
                paymentMethod: client.attributes.Payment_Method.data !== null ? client.attributes.Payment_Method.data.id : "",
                identifier: client.attributes.Identifier,
                lastPurchaseDate: client.attributes.LastPurchaseDate,
                note: client.attributes.Note,
                customerType: client.attributes.CustomerType,
                links: client.attributes.Links,
                customerCode: client.attributes.CustomerCode,
            };
            return data;
        })
        .catch(error => { throw error; });
    },
    getClientByCustomerCode: function (_customerCode) {
        return instance.request({
        url: `/customers?filters[CustomerCode][$eq]=${_customerCode}`,
        method: 'GET',
        })
        .then(response => {
            let client = response.data.data[0]
            if (client === undefined)
                return undefined;
            
            const data = {
                id: client.id,
                identifier: client.attributes.Identifier,
                fullName: client.attributes.FullName,
                customerType: client.attributes.CustomerType,
                customerCode: client.attributes.CustomerCode,
            };
            return data;
        })
        .catch(error => { throw error; });
    },
    create: function(_data) {
        let data = {
            'data': {
                "FullName": _data.fullName,
                "Email": _data.email === "" ? null : _data.email,
                "Telephone": _data.telephone,
                "Address": _data.address,
                "Identifier": _data.identifier,
                "LastPurchaseDate": _data.lastPurchaseDate === "" ? null : _data.lastPurchaseDate,
                "Note": _data.note,
                "CustomerType": _data.customerType,
                "Active": true,
                "Links": _data.links,
                "CustomerCode": _data.customerCode,
                "Product_Preferences": _data.productPreferences !== "" 
                ? 
                    {
                        "id": _data.productPreferences
                    }
                :
                    null,
                "Payment_Method": _data.paymentMethod !== "" 
                ?
                    {
                        "id": _data.paymentMethod
                    }
                : 
                    null
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
                "Email": _data.email === "" ? null : _data.email,
                "Telephone": _data.telephone,
                "Address": _data.address,
                "Identifier": _data.identifier,
                "LastPurchaseDate": _data.lastPurchaseDate === "" ? null : _data.lastPurchaseDate,
                "Note": _data.note,
                "CustomerType": _data.customerType,
                "Active": true,
                "Links": _data.links,
                "CustomerCode": _data.customerCode,
                "Product_Preferences": _data.productPreferences !== "" 
                ? 
                    {
                        "id": _data.productPreferences
                    }
                :
                    null,
                "Payment_Method": _data.paymentMethod !== "" 
                ?
                    {
                        "id": _data.paymentMethod
                    }
                : 
                    null
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
