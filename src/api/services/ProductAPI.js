import instance from '../axios';

export const ProductAPI = {
    getAllProductsBasicInfo: function () {
        return instance.request({
        url: `/products?fields[0]=BarCode&fields[1]=Name&populate[Supplier][fields][0]=id`,
        method: 'GET',
        })
        .then(response => {
            const data = response.data.data.map(product => ({
                id: product.id,
                productId: product.id, // sirve para evitar error con el autoComplete en editar. (porque necesito purchesOrderProductId como id en caso de editar un purchas order product)
                barCode: product.attributes.BarCode,
                name: product.attributes.Name,
                supplierId: product.attributes.Supplier.data.id
            }));
            return data;
        })
        .catch(error => { throw error; });
    },
    getInventory: function () {
        return instance.request({
        url: `/products?fields[0]=BarCode&fields[1]=Name&fields[2]=Description&fields[3]=MinimumQuantity&fields[4]=RetailPrice&fields[5]=WholesalePrice&populate[Warehouse_Inventories][fields][0]=Quantity&populate[Category][fields][0]=Name`,
        method: 'GET',
        })
        .then(response => {
            const data = response.data.data.map(product => ({
                id: product.id,
                BarCode: product.attributes.BarCode,
                Name: product.attributes.Name,
                Description: product.attributes.Description,
                MinimumQuantity: product.attributes.MinimumQuantity,
                RetailPrice: product.attributes.RetailPrice,
                WholesalePrice: product.attributes.WholesalePrice,
                Quantity: product.attributes.Warehouse_Inventories.data.length > 0 
                ? 
                product.attributes.Warehouse_Inventories.data.reduce((a, b) => (
                    {
                        attributes: {
                            Quantity: a.attributes.Quantity + b.attributes.Quantity
                        }
                    }
                )).attributes.Quantity
                :
                0,
                // Warehouse_Inventories: product.attributes.Warehouse_Inventories.data.map(inventory => ({
                //     id: inventory.id,
                //     Quantity: inventory.attributes.Quantity
                // })),
                Category: product.attributes.Category.data.attributes.Name,
            }));
            return data;
        })
        .catch(error => { throw error; });
    },
    getProductByBarCode: function (_barCode) {
        return instance.request({
        url: `/products?filters[BarCode][$eq]=${_barCode}&populate[Photos][fields][0]=url&populate[Photos][fields][1]=id&populate[Category][fields][0]=id&populate[Supplier][fields][0]=id`,
        method: 'GET',
        })
        .then(response => {

            let product = response.data.data[0]
            let dimensionArray = product.attributes.Dimensions.split('x');
            let length = dimensionArray[0] !== undefined ? dimensionArray[0] : '';
            let width = dimensionArray[1] !== undefined ? dimensionArray[1] : '';
            let height = dimensionArray[2] !== undefined ? dimensionArray[2] : '';
            const data = {
                id: product.id,
                barCode: product.attributes.BarCode,
                name: product.attributes.Name,
                description: product.attributes.Description,
                retailPrice: product.attributes.RetailPrice,
                wholesalePrice: product.attributes.WholesalePrice,
                minimumQuantity: product.attributes.MinimumQuantity,
                weight: product.attributes.Weight === null ? '' : product.attributes.Weight,
                warranty: product.attributes.Warranty !== null ? product.attributes.Warranty : "",
                length: length, 
                width: width,
                height: height,
                supplier: product.attributes.Supplier.data.id,
                category: product.attributes.Category.data.id,
                oldImageId: product.attributes.Photos?.data?.id ?? "",
                oldImageUrl: product.attributes.Photos.data !== null ? `${process.env.REACT_APP_BASE_URL}${product.attributes.Photos.data.attributes.url}` : null
            };
            return data;
        })
        .catch(error => { throw error; });
    },

    getProductById: function (_id) {
        return instance.request({
        
        url: `/products/${_id}?populate[Photos][fields][0]=url&populate[Photos][fields][1]=id&populate[Category][fields][0]=id&populate[Supplier][fields][0]=id`,
        method: 'GET',
        })
        .then(response => {
            let dimensionArray = response.data.data.attributes.Dimensions.split('x');
            let length = dimensionArray[0] !== undefined ? dimensionArray[0] : '';
            let width = dimensionArray[1] !== undefined ? dimensionArray[1] : '';
            let height = dimensionArray[2] !== undefined ? dimensionArray[2] : '';
            const data = {
                id: response.data.data.id,
                barCode: response.data.data.attributes.BarCode,
                name: response.data.data.attributes.Name,
                description: response.data.data.attributes.Description,
                retailPrice: response.data.data.attributes.RetailPrice,
                wholesalePrice: response.data.data.attributes.WholesalePrice,
                minimumQuantity: response.data.data.attributes.MinimumQuantity,
                weight: response.data.data.attributes.Weight === null ? '' : response.data.data.attributes.Weight,
                warranty: response.data.data.attributes.Warranty !== null ? response.data.data.attributes.Warranty : "",
                length: length, 
                width: width,
                height: height,
                supplier: response.data.data.attributes.Supplier.data.id,
                category: response.data.data.attributes.Category.data.id,
                oldImageId: response.data.data.attributes.Photos?.data?.id ?? "",
                oldImageUrl: response.data.data.attributes.Photos.data !== null ? `${process.env.REACT_APP_BASE_URL}${response.data.data.attributes.Photos.data.attributes.url}` : null
            };
            return data;
        })
        .catch(error => { throw error; });
    },
    create: function(_data) {
        let data = {
            'data': {
                "BarCode": _data.barCode,
                "Name": _data.name,
                "Description": _data.description,
                "RetailPrice": _data.retailPrice,
                "WholesalePrice": _data.wholesalePrice,
                "MinimumQuantity": _data.minimumQuantity,
                "Weight": _data.weight !== '' ? _data.weight : null,
                "Dimensions": `${_data.length}x${_data.width}x${_data.height}`,
                "Warranty": _data.warranty !== '' ? _data.warranty : null,
                "Active": true,
                "Supplier": {
                    "id": _data.supplier
                },
                "Category": {
                    "id": _data.category
                }
            }
        }
        return instance.request({
            url: `/products`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    uploadFile: function(file, productId) {
        // Crear un objeto FormData para manejar el archivo
        let formData = new FormData();
        formData.append('files', file);
        formData.append('ref', 'api::product.product'); // Nombre del modelo
        formData.append('refId', productId); // ID de la orden de compra
        formData.append('field', 'Photos'); // El nombre del campo de archivo en el modelo

        return instance.request({
            url: `/upload`,
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    deleteFile: function(_fileId) {
        return instance.request({
            url: `/upload/files/${_fileId}`,
            method: 'DELETE',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    update: function(_data) {
        let data = {
            'data': {
                "BarCode": _data.barCode,
                "Name": _data.name,
                "Description": _data.description,
                "RetailPrice": _data.retailPrice,
                "WholesalePrice": _data.wholesalePrice,
                "MinimumQuantity": _data.minimumQuantity,
                "Weight": _data.weight !== '' ? _data.weight : null,
                "Dimensions": `${_data.length}x${_data.width}x${_data.height}`,
                "Warranty": _data.warranty !== '' ? _data.warranty : null,
                "Active": true,
                "Supplier": {
                    "id": _data.supplier
                },
                "Category": {
                    "id": _data.category
                }
            }
        }
        return instance.request({
            url: `/products/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
