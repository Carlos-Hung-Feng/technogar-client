import instance from '../axios';

export const NcfAPI = {
    getNcfByCode: function (_ncfCode) {
        return instance.request({
        url: `/ncfs?filters[Code][$eq]=${_ncfCode}`,
        method: 'GET',
        })
        .then(response => {
            let NCF = response.data.data[response.data.data.length - 1]
            // TODO: Modificar el json.
            let data = undefined;
            
            if(NCF !== undefined) {
                data = {
                    id: NCF.id,
                    code: NCF.attributes.Code,
                    startRange: NCF.attributes.StartRange,
                    endRange: NCF.attributes.EndRange,
                    currentValue: NCF.attributes.CurrentValue,
                };
            }
            return data;
        })
        .catch(error => { throw error; });
    },
    getNfcByNCF: function (_ncf) {
        return instance.request({
        url: `/ncfs?filters[StartRange][$lte]=${_ncf}&filters[EndRange][$gte]=${_ncf}`,
        method: 'GET',
        })
        .then(response => {
            console.log(response);
            let NCF = response.data.data[response.data.data.length - 1]
            // TODO: Modificar el json.
            let data = undefined;
            
            if(NCF !== undefined) {
                data = {
                    id: NCF.id,
                    code: NCF.attributes.Code,
                    startRange: NCF.attributes.StartRange,
                    endRange: NCF.attributes.EndRange,
                    currentValue: NCF.attributes.CurrentValue,
                };
            }
            return data;
        })
        .catch(error => { throw error; });
    },
    update: function(_data) {
        let data = {
            'data': {
                "CurrentValue": _data.currentValue,
            }
        }
        return instance.request({
            url: `/ncfs/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
};
