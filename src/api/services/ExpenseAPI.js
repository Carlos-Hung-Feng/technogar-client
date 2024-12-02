import instance from '../axios';

export const ExpenseAPI = {
    create: function(_data) {
        let data = {
            'data': {
                "Amount": _data.amount,
                "Description": _data.description,
                "Type": _data.type,
            }
        }
        return instance.request({
            url: `/expenses`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
