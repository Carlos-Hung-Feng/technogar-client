import instance from '../axios';

export const InvoiceAPI = {
    getInvoiceTotalBetweenDate: function (_date1, _date2) {
        return instance.request({
        url: `/invoices?filters[createdAt][$gte]=${_date1}&filters[createdAt][$lt]=${_date2}&filters[Status][$ne]=Canceled&[fields]0]=Total&populate[Payment_Method][fields][0]=id&populate[Payment_Method][fields][1]=Name`,
        method: 'GET',
        })
        .then(response => {
            const dataList = response.data.data.map(invoice => ({
                paymentMethodId: invoice.attributes.Payment_Method.data.id,
                paymentMethodName: invoice.attributes.Payment_Method.data.attributes.Name,
                total: invoice.attributes.Total
            }))
            return dataList;
        })
        .catch(error => { throw error; });
    },
    getInvoiceByInvoiceNumber: function (_number) {
        return instance.request({
        url: `/invoices?populate[Payment_Method][fields][0]=id&filters[InvoiceNumber][$eq]=${_number}&populate[Customer][fields][0]=id&populate[Customer][fields][1]=Identifier&populate[BilledBy][fields][0]=id&populate[Invoice_Discount][fields][0]=id&populate[Invoice_Discount][fields][1]=DiscountPercentage&populate[CreditNoteApplied][fields][0]=CreditNoteNumber&populate[CreditNoteApplied][fields][1]=Total&populate[Invoice_Products][fields][0]=Price&populate[Invoice_Products][fields][1]=ReturnReason&populate[Invoice_Products][populate][CreditNote][fields][0]=CreditNoteNumber&populate[Invoice_Products][populate][Product][fields][0]=id&populate[Invoice_Products][populate][Product][fields][1]=Name&populate[Invoice_Products][populate][Product][fields][2]=BarCode&populate[Invoice_Products][populate][Product][fields][3]=Description&populate[Invoice_Products][populate][Product][fields][4]=Warranty`,
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
                    total: invoice.attributes.Total,
                    createdAt: invoice.attributes.createdAt,
                    creditNoteAppliedNumber: invoice.attributes.CreditNoteApplied.data !== null ? invoice.attributes.CreditNoteApplied.data.attributes.CreditNoteNumber : "",
                    creditNoteAppliedValue: invoice.attributes.CreditNoteApplied.data !== null ? invoice.attributes.CreditNoteApplied.data.attributes.Total : 0,
                    paymentMethodId: invoice.attributes.Payment_Method.data.id,
                    customerId: invoice.attributes.Customer.data !== null ? invoice.attributes.Customer.data.id : '',
                    searchClientParam: invoice.attributes.Customer.data !== null ? invoice.attributes.Customer.data.attributes.Identifier : "",
                    billedById: invoice.attributes.BilledBy.data.id,
                    discountId: invoice.attributes.Invoice_Discount.data !== null ? invoice.attributes.Invoice_Discount.data.id : '',
                    invoice_Products: invoice.attributes.Invoice_Products.data.map(invoiceProduct => ({
                        id: invoiceProduct.id,
                        productId: invoiceProduct.attributes.Product.data.id,
                        barCode: invoiceProduct.attributes.Product.data.attributes.BarCode,
                        name: invoiceProduct.attributes.Product.data.attributes.Name,
                        description: invoiceProduct.attributes.Product.data.attributes.Description,
                        warranty: invoiceProduct.attributes.Product.data.attributes.Warranty?? "",
                        returnReason: invoiceProduct.attributes.ReturnReason !== null ? invoiceProduct.attributes.ReturnReason === "Warranty" ? "Garantía" : "Cambio" : "",
                        price: invoiceProduct.attributes.Price,
                        discount: invoice.attributes.Invoice_Discount.data !== null ? invoiceProduct.attributes.Price * (invoice.attributes.Invoice_Discount.data.attributes.DiscountPercentage/100) : 0,
                        subtotal: invoice.attributes.Invoice_Discount.data !== null ? invoiceProduct.attributes.Price - invoiceProduct.attributes.Price * (invoice.attributes.Invoice_Discount.data.attributes.DiscountPercentage/100) : invoiceProduct.attributes.Price,
                        creditNoteNumber: invoiceProduct.attributes.CreditNote.data !== null ? invoiceProduct.attributes.CreditNote.data.attributes.CreditNoteNumber : "",
                    }))
                };
            }
            return data;
        })
        .catch(error => { throw error; });
    },
    create: function(_data) {
        console.log(_data)
        let data = {
            'data': {
                "InvoiceNumber": _data.invoiceNumber,
                "PaidWith": parseFloat(_data.paidWith),
                "Returned": _data.returned,
                "NIF": _data.NIF,
                "RNC": _data.RNC,
                "Note": _data.note,
                "Status": _data.status,
                "Total": _data.total,
                "CreditNoteApplied": {
                    "id": _data.creditNoteAppliedId,
                },
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

        if (_data.creditNoteAppliedId === "") {
            delete data.data.CreditNoteApplied;
        }
        if (_data.customerId === "") {
            delete data.data.Customer;
        }
        if (_data.discountId === "") {
            delete data.data.Invoice_Discount;
        }
        if (_data.NIF === "") {
            delete data.data.NIF;
        }

        console.log(data);

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
                "Product": {
                    "id": _product.productId
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
