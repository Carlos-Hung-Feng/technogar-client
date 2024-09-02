import instance from '../axios';

export const PurchaseOrderAPI = {
    // getAll: function () {
    //     return instance.request({
    //     url: `/purchase-orders`,
    //     method: 'GET',
    //     })
    //     .then(response => response.data)
    //     .catch(error => { throw error; });
    // },
    getOrderByOrderNumber: function (_number) {
        return instance.request({
        url: `/purchase-orders?filters[OrderNumber][$eq]=${_number}&populate[Supplier][fields][0]=id&populate[Payment_Method][fields][0]=id&populate[Warehouse][fields][0]=id&populate[Ordered_By][fields][0]=id&populate[PurchaseOrder_Products][fields][0]=Price&populate[PurchaseOrder_Products][fields][1]=Quantity&populate[PurchaseOrder_Products][populate][Product][fields][0]=id&populate[PurchaseOrder_Products][populate][Product][fields][1]=Name&populate[PurchaseOrder_Products][populate][Product][fields][2]=BarCode&populate[Document][fields][0]=id&populate[Document][fields][1]=name&populate[Document][fields][2]=url`,
        method: 'GET',
        })
        .then(response => {
            let order = response.data.data[0]

            if (order === undefined)
                return undefined;
            // TODO: Modificar el json.
            const data = {
                id: order.id,
                orderNumber: order.attributes.OrderNumber,
                telephone: order.attributes.Telephone,
                orderedDate: order.attributes.OrderedDate,
                tax: order.attributes.Tax,
                freight: order.attributes.Freight,
                shippingAddress: order.attributes.ShippingAddress,
                note: order.attributes.Note,
                supplier: order.attributes.Supplier?.data?.id ?? null,
                paymentMethod: order.attributes.Payment_Method?.data?.id ?? null,
                warehouse: order.attributes.Warehouse?.data?.id ?? null,
                orderedBy: order.attributes.Ordered_By?.data?.id ?? null,
                product: null,
                quantity: "",
                cost: "",
                purchaseOrder_Products: order.attributes.PurchaseOrder_Products.data.map(orderdProduct => ({
                    id: orderdProduct.id,
                    productId: orderdProduct.attributes.Product?.data?.id ?? null,
                    barCode: orderdProduct.attributes.Product?.data?.attributes?.BarCode ?? '',
                    name: orderdProduct.attributes.Product?.data?.attributes?.Name ?? '',
                    quantity: orderdProduct.attributes.Quantity,
                    cost: orderdProduct.attributes.Price,
                    subtotal: orderdProduct.attributes.Quantity * orderdProduct.attributes.Price
                })),
                oldDocumentId: order.attributes.Document?.data?.id ?? "",
                oldDocumentUrl: order.attributes.Document.data!==null ? `${process.env.REACT_APP_BASE_URL}${order.attributes.Document.data.attributes.url}` : null,
                // documentName: order.attributes.Document?.data?.attributes?.name ?? ""
            };
            
            return data;
        })
        .catch(error => { throw error; });
    },
    create: function(_data) {
        let data = {
            'data': {
                "OrderNumber": _data.orderNumber,
                "Telephone": _data.telephone,
                "OrderedDate": _data.orderedDate,
                "Tax": _data.tax,
                "Freight": _data.freight,
                "ShippingAddress": _data.shippingAddress,
                "Note": _data.note,
                "Supplier": {
                    "id": _data.supplier
                },
                "Payment_Method": {
                    "id": _data.paymentMethod
                },
                "Warehouse": {
                    "id": _data.warehouse
                },
                "Ordered_By": {
                    "id": _data.orderedBy
                }
            }
        }
        return instance.request({
            url: `/purchase-orders`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    uploadFile: function(file, purchaseOrderId) {
        // Crear un objeto FormData para manejar el archivo
        let formData = new FormData();
        formData.append('files', file);
        formData.append('ref', 'api::purchase-order.purchase-order'); // Nombre del modelo
        formData.append('refId', purchaseOrderId); // ID de la orden de compra
        formData.append('field', 'Document'); // El nombre del campo de archivo en el modelo

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
                "Telephone": _data.telephone,
                "OrderedDate": _data.orderedDate,
                "Tax": _data.tax,
                "Freight": _data.freight,
                "ShippingAddress": _data.shippingAddress,
                "Note": _data.note,
                "Payment_Method": {
                    "id": _data.paymentMethod
                },
            }
        }
        return instance.request({
            url: `/purchase-orders/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    addOrderProduct: function(_orderId, _product) {
        let data = {
            'data': {
                "Price": _product.cost,
                "Quantity": _product.quantity,
                "Product": {
                    "id": _product.productId
                },
                "Purchase_Order": {
                    "id": _orderId
                }
            }
        }
        return instance.request({
            url: `/purchase-order-products`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    updateOrderProduct: function(_orderId, _orderProduct) {
        let data = {
            'data': {
                "Price": _orderProduct.cost,
                "Quantity": _orderProduct.quantity,
                "Product": {
                    "id": _orderProduct.productId
                },
                "Purchase_Order": {
                    "id": _orderId
                }
            }
        }
        return instance.request({
            url: `/purchase-order-products/${_orderProduct.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    deleteOrderProduct: function(_orderProductId) {
        return instance.request({
            url: `/purchase-order-products/${_orderProductId}`,
            method: 'DELETE'
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
};
