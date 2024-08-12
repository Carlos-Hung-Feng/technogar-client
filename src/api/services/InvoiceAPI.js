import instance from '../axios';

export const InvoiceAPI = {
    getInvoiceByInvoiceNumber: function (_number) {
        return instance.request({
        url: `/invoices?filters[InvoiceNumber][$eq]=${_number}&populate[Payment_Method][fields][0]=id&populate[Customer][fields][0]=id&populate[Customer][fields][1]=Identifier&populate[BilledBy][fields][0]=id&populate[Invoice_Discount][fields][0]=id&populate[Invoice_Products][fields][0]=Price&populate[Invoice_Products][fields][1]=Quantity&populate[Invoice_Products][populate][Product][fields][0]=id&populate[Invoice_Products][populate][Product][fields][1]=Name&populate[Invoice_Products][populate][Product][fields][2]=BarCode&populate[Invoice_Products][populate][Product][fields][3]=Description`,
        method: 'GET',
        })
        .then(response => {
            let invoice = response.data.data[0]
            // TODO: Modificar el json.
            let data = undefined;
            
            if(invoice !== undefined) {
                data = {
                    id: invoice.id,
                    invoiceNumber: invoice.attributes.InvoiceNumber,
                    searchInvoiceParam: invoice.attributes.InvoiceNumber,
                    NIF: invoice.attributes.NIF,
                    RNC: invoice.attributes.RNC,
                    note: invoice.attributes.Note,
                    paidWith: invoice.attributes.PaidWith,
                    returned: invoice.attributes.Returned,
                    status: invoice.attributes.Status,
                    paymentMethodId: invoice.attributes.Payment_Method.data.id,
                    customerId: invoice.attributes.Customer.data !== null ? invoice.attributes.Customer.data.id : '',
                    searchClientParam: invoice.attributes.Customer.data !== null ? invoice.attributes.Customer.data.attributes.Identifier : "",
                    billedById: invoice.attributes.BilledBy.data.id,
                    discountId: invoice.attributes.Invoice_Discount.data !== null ? invoice.attributes.Invoice_Discount.data.id : '',
                    invoice_Products: invoice.attributes.Invoice_Products.data.map(invoiceProduct => ({
                        id: invoiceProduct.id,
                        productId: invoiceProduct.attributes.Product.data.id,
                        barCode: invoiceProduct.attributes.Product.data.attributes.BarCode,
                        quantity: invoiceProduct.attributes.Quantity,
                        name: invoiceProduct.attributes.Product.data.attributes.Name,
                        description: invoiceProduct.attributes.Product.data.attributes.Description,
                        price: invoiceProduct.attributes.Price,
                        subtotal: invoiceProduct.attributes.Quantity * invoiceProduct.attributes.Price,
                    }))
                };
            }
            return data;
        })
        .catch(error => { throw error; });
    },
    create: function(_data) {
        let data = {
            'data': {
                "InvoiceNumber": _data.invoiceNumber,
                "PaidWith": parseFloat(_data.paidWith),
                "Returned": _data.returned,
                "NIF": _data.NIF,
                "RNC": _data.RNC,
                "Note": _data.note,
                "Status": _data.status,
                "Payment_Method": {
                    "id": _data.paymentMethodId
                },
                "BilledBy": {
                    "id": _data.billedById
                },
                "Customer": {
                    "id": _data.customerId
                },
                "Invoice_Discount": {
                    "id": _data.discountId
                }
            }
        }

        if (_data.customerId === "") {
            delete data.data.Customer;
        }
        if (_data.discountId === "") {
            delete data.data.Invoice_Discount;
        }

        return instance.request({
            url: `/invoices`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    update: function(_data) {
        let data = {
            'data': {
                "Status": _data.status,
            }
        }
        return instance.request({
            url: `/invoices/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    addInvoiceProduct: function(_invoiceId, _product) {
        let data = {
            'data': {
                "Price": _product.price,
                "Quantity": _product.quantity,
                "Product": {
                    "id": _product.id
                },
                "Invoice": {
                    "id": _invoiceId
                }
            }
        }
        return instance.request({
            url: `/invoice-products`,
            method: 'POST',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
