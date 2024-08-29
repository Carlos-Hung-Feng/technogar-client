import instance from '../axios';

export const CreditNoteAPI = {
    getCreditNoteByCreditNoteNumber: function (_number) {
        return instance.request({
        url: `/credit-notes?filters[CreditNoteNumber][$eq]=${_number}&populate[GeneratedUser][fields][0]=id&populate[AppliedToInvoice][fields][0]=InvoiceNumber&populate[Invoice_Products][fields][0]=Price&populate[Invoice_Products][fields][1]=ReturnReason&populate[Invoice_Products][populate][CreditNote][fields][0]=CreditNoteNumber&populate[Invoice_Products][populate][Invoice][fields][0]=InvoiceNumber&populate[Invoice_Products][populate][Product][fields][0]=id&populate[Invoice_Products][populate][Product][fields][1]=Name&populate[Invoice_Products][populate][Product][fields][2]=BarCode&populate[Invoice_Products][populate][Invoice][populate][Invoice_Discount][fields][0]=DiscountPercentage`,
        method: 'GET',
        })
        .then(response => {
            let creditNote = response.data.data[0]
            // TODO: Modificar el json.
            let data = undefined;
            
            if(creditNote !== undefined) {
                data = {
                    id: creditNote.id,
                    creditNoteNumber: creditNote.attributes.CreditNoteNumber,
                    invoiceNumber: creditNote.attributes.Invoice_Products.data[0].attributes.Invoice.data.attributes.InvoiceNumber,
                    generatedUserId: creditNote.attributes.GeneratedUser.data.id,
                    appliedToInvoiceId: creditNote.attributes.AppliedToInvoice.data !== null ? creditNote.attributes.AppliedToInvoice.data.id : "",
                    appliedToInvoiceNumber: creditNote.attributes.AppliedToInvoice.data !== null ? creditNote.attributes.AppliedToInvoice.data.attributes.InvoiceNumber : "",
                    total: creditNote.attributes.Total,
                    createdAt: creditNote.attributes.createdAt,
                    status: creditNote.attributes.Status,
                
                    searchInvoiceParam: creditNote.attributes.Invoice_Products.data[0].attributes.Invoice.data.attributes.InvoiceNumber,
                    searchCreditNoteParam: creditNote.attributes.CreditNoteNumber,
                    invoice_Products: creditNote.attributes.Invoice_Products.data.map(invoiceProduct => ({
                        id: invoiceProduct.id,
                        productId: invoiceProduct.attributes.Product.data.id,
                        barCode: invoiceProduct.attributes.Product.data.attributes.BarCode,
                        name: invoiceProduct.attributes.Product.data.attributes.Name,
                        description: invoiceProduct.attributes.Product.data.attributes.Description,
                        returnReason: invoiceProduct.attributes.ReturnReason !== null ? invoiceProduct.attributes.ReturnReason === "Warranty" ? "Garantía" : "Cambio" : "",
                        price: invoiceProduct.attributes.Price,
                        discount: invoiceProduct.attributes.Invoice.data.attributes.Invoice_Discount.data !== null ? invoiceProduct.attributes.Price * (invoiceProduct.attributes.Invoice.data.attributes.Invoice_Discount.data.attributes.DiscountPercentage/100) : 0,
                        subtotal: invoiceProduct.attributes.Invoice.data.attributes.Invoice_Discount.data !== null ? invoiceProduct.attributes.Price - invoiceProduct.attributes.Price * (invoiceProduct.attributes.Invoice.data.attributes.Invoice_Discount.data.attributes.DiscountPercentage/100) : invoiceProduct.attributes.Price,
                        creditNoteNumber: invoiceProduct.attributes.CreditNote.data !== null ? invoiceProduct.attributes.CreditNote.data.attributes.CreditNoteNumber : "",
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
                "CreditNoteNumber": _data.creditNoteNumber,
                "Total": _data.total,
                "Status": _data.status,
                "GeneratedUser": {
                    "id": _data.generatedUserId
                },
            }
        }

        return instance.request({
            url: `/credit-notes`,
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
            url: `/credit-notes/${_data.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    delete: function(_data) {
        return instance.request({
            url: `/credit-notes/${_data.id}`,
            method: 'DELETE',
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    },
    updateInvoiceProduct: function(_invoiceProduct, _creditNoteId = "", ) {
        let data = {
            'data': {
                "ReturnReason": _invoiceProduct.returnReason === "Cambio" ? "Change" : "Warranty",
                "CreditNote": {
                    "id": _creditNoteId
                }
            }
        }

        if(_creditNoteId === "") {
            data = {
                'data': {
                    "ReturnReason": null,
                }
            }
        }
        return instance.request({
            url: `/invoice-products/${_invoiceProduct.id}`,
            method: 'PUT',
            data: data
        })
        .then(response => response.data)
        .catch(error => { throw error; });
    }
};
