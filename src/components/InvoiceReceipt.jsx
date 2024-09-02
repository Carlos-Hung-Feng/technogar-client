import React from "react";
import { Box, Typography } from "@mui/material";
import Barcode from "react-barcode";

const InvoiceReceipt = React.forwardRef(({ invoiceData }, ref) => {
  if (!invoiceData) {
    return null; // Maneja el caso en que no se haya pasado invoiceData
  }

  return (
    <Box
      p={3}
      style={{
        width: "49mm",
        height: "auto",
        backgroundColor: "#fff",
        fontFamily: "monospace",
        color: "black",
        padding: "0px",
      }}
      ref={ref}
      className="receipt"
    >
      <Box className="header">
        <Typography>.</Typography>
        <Typography fontWeight={"bold"} align="center" fontSize={"20px"}>
          TechnOgar.S.R.L
        </Typography>
        <Typography align="center">
          Av. San Vicente de Paul # 5, Alma Rosa I, Santo Domingo Este 11504
        </Typography>
        <Typography>RNC: 133052202</Typography>
        <Typography>Tel: (829) 397-5667</Typography>
      </Box>

      <Typography align="center">
        -------------------------------------------
      </Typography>

      {invoiceData.isCopy && (
        <Typography align="center" fontSize={"13px"}>
          *Copia de factura*
        </Typography>
      )}
      <Typography align="center" fontWeight={"bold"} fontSize={"13px"}>
        Factura para{" "}
        {invoiceData.clientRNC !== "" ? "Credito Fiscal" : "Consumidor Final"}
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Typography fontWeight={"bold"}>
        Factura #: {invoiceData.invoiceNumber}
      </Typography>
      {invoiceData.NCF && <Typography>NCF #: {invoiceData.NCF}</Typography>}
      <Typography>
        {new Date(invoiceData.createdAt).toLocaleString()}
      </Typography>
      {invoiceData.clientName && (
        <Typography>Cliente: {invoiceData.clientName}</Typography>
      )}
      {invoiceData.clientRNC && (
        <Typography>RNC: {invoiceData.clientRNC}</Typography>
      )}
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
        <Typography>Desc.</Typography>
        <Typography align="center">ITBIS</Typography>
        <Typography align="right">Valor</Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      {invoiceData.products.map((product, index) => (
        <Box key={index}>
          <Typography fontWeight={"bold"} fontSize={"11px"}>
            {product.barCode} - {product.name}
          </Typography>
          {product.warranty && (
            <Typography fontWeight={"bold"} fontSize={"11px"}>
              Meses de garantía: {product.warranty}
            </Typography>
          )}
          <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
            <Typography fontSize={"11px"}>1.00</Typography>
            <Typography align="center" fontSize={"11px"}>
              {(
                Math.round((product.price - product.price / 1.18) * 100) / 100
              ).toLocaleString("en", { minimumFractionDigits: 2 })}
            </Typography>
            <Typography align="right" fontSize={"11px"}>
              {product.price.toLocaleString("en", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </Box>
      ))}
      <Typography align="center">
        -------------------------------------------
      </Typography>
      {invoiceData.subtotal !== invoiceData.total && (
        <Box display={"grid"} gridTemplateColumns={"1.5fr 2fr 1.5fr"}>
          <Typography>Subtotal:</Typography>
          <Typography align="center">
            {(
              Math.round(
                (invoiceData.subtotal - invoiceData.subtotal / 1.18) * 100
              ) / 100
            ).toLocaleString("en", { minimumFractionDigits: 2 })}
          </Typography>
          <Typography align="right">
            {invoiceData.subtotal.toLocaleString("en", {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      )}

      {invoiceData.discount > 0 && (
        <Box display={"grid"} gridTemplateColumns={"1.5fr 2fr 1.5fr"}>
          <Typography>
            Dto.&#40;{invoiceData.discountPersentage}%&#41;:
          </Typography>
          <Typography align="center">
            -
            {(
              Math.round(
                (invoiceData.discount - invoiceData.discount / 1.18) * 100
              ) / 100
            ).toLocaleString("en", { minimumFractionDigits: 2 })}
          </Typography>
          <Typography align="right">
            -
            {invoiceData.discount.toLocaleString("en", {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      )}
      {invoiceData.creditNoteAppliedValue > 0 && (
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography>
            NC &#40;{invoiceData.creditNoteAppliedNumber}&#41;:
          </Typography>
          <Typography>
            -
            {invoiceData.creditNoteAppliedValue.toLocaleString("en", {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      )}
      <Box display={"grid"} gridTemplateColumns={"1.5fr 2fr 1.5fr"}>
        <Typography fontWeight={"bold"}>Total:</Typography>
        <Typography fontWeight={"bold"} align="center">
          {(
            Math.round((invoiceData.total - invoiceData.total / 1.18) * 100) /
            100
          ).toLocaleString("en", { minimumFractionDigits: 2 })}
        </Typography>
        <Typography fontWeight={"bold"} align="right">
          {invoiceData.total.toLocaleString("en", {
            minimumFractionDigits: 2,
          })}
        </Typography>
      </Box>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography>{invoiceData.paymentMethod}:</Typography>
        <Typography>
          {invoiceData.paidWith === ""
            ? 0
            : parseFloat(invoiceData.paidWith).toLocaleString("en", {
                minimumFractionDigits: 2,
              })}
        </Typography>
      </Box>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography>Cambio:</Typography>
        <Typography>
          {invoiceData.change.toLocaleString("en", {
            minimumFractionDigits: 2,
          })}
        </Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Barcode
        value={invoiceData.invoiceNumber}
        height={40}
        displayValue={false}
      />
      <Typography fontSize={"10px"}>
        Para cualquier reclamación de garantía, es indispensable presentar el
        producto con su caja original y el recibo de compra.
      </Typography>
      <Typography fontWeight={"bold"} align="center" mt={1}>
        ¡Gracias por preferirnos!
      </Typography>
      <Typography>.</Typography>
    </Box>
  );
});

export default InvoiceReceipt;
