import React from "react";
import { Box, Typography } from "@mui/material";
import Barcode from "react-barcode";

const Receipt = React.forwardRef(({ invoiceData }, ref) => {
  if (!invoiceData) {
    return null; // Maneja el caso en que no se haya pasado invoiceData
  }

  return (
    <Box
      p={3}
      style={{
        width: "48mm",
        height: "auto",
        backgroundColor: "#fff",
        fontFamily: "monospace",
        color: "black",
        padding: "15px 0px",
      }}
      ref={ref}
      className="receipt"
    >
      <Box className="header">
        <Typography fontWeight={"bold"} align="center" fontSize={"20px"}>
          TechnOgar.S.R.L
        </Typography>
        <Typography align="center">
          Av. San Vicente de Paul # 5, Alma Rosa I, Santo Domingo Este 11504
        </Typography>
        <Typography align="center">Tel: (829) 397-5667</Typography>
      </Box>

      <Typography align="center">
        ------------------------------------------
      </Typography>

      <Typography fontWeight={"bold"}>
        Factura #: {invoiceData.invoiceNumber}
      </Typography>
      <Typography>{new Date().toLocaleString() + ""}</Typography>
      {invoiceData.clientName && (
        <Typography>Cliente: {invoiceData.clientName}</Typography>
      )}
      {invoiceData.clientRNC && (
        <Typography>RNC: {invoiceData.clientRNC}</Typography>
      )}
      <Typography align="center">
        ------------------------------------------
      </Typography>
      <Typography align="center" fontWeight={"bold"} fontSize={"13px"}>
        Factura para{" "}
        {invoiceData.clientRNC !== "" ? "Credito Fiscal" : "Consumidor Final"}
      </Typography>
      <Typography align="center">
        ------------------------------------------
      </Typography>
      <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
        <Typography>Cant.</Typography>
        <Typography align="center">ITBIS</Typography>
        <Typography align="right">Valor{invoiceData.clientRNC}</Typography>
      </Box>
      <Typography align="center">
        ------------------------------------------
      </Typography>
      {invoiceData.products.map((product, index) => (
        <Box key={index}>
          <Typography fontWeight={"bold"} fontSize={"11px"}>
            {product.barCode} - {product.name}
          </Typography>
          <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
            <Typography fontSize={"11px"}>
              {product.quantity}x
              {product.price.toLocaleString("en", { minimumFractionDigits: 2 })}
            </Typography>
            <Typography align="center" fontSize={"11px"}>
              {(
                Math.round(
                  (product.price * product.quantity -
                    (product.price * product.quantity) / 1.18) *
                    100
                ) / 100
              ).toLocaleString("en", { minimumFractionDigits: 2 })}
            </Typography>
            <Typography align="right" fontSize={"11px"}>
              {(product.price * product.quantity).toLocaleString("en", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </Box>
      ))}
      <Typography align="center">
        ------------------------------------------
      </Typography>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography>Subtotal:</Typography>
        <Typography>
          {invoiceData.subtotal.toLocaleString("en", {
            minimumFractionDigits: 2,
          })}
        </Typography>
      </Box>
      {invoiceData.discount > 0 && (
        <Box display={"flex"} justifyContent={"space-between"}>
          <Typography>Descuento:</Typography>
          <Typography>
            {invoiceData.discount.toLocaleString("en", {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      )}
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography>Total:</Typography>
        <Typography>
          {invoiceData.total.toLocaleString("en", { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography>{invoiceData.paymentMethod}:</Typography>
        <Typography>
          {parseFloat(invoiceData.paidWith).toLocaleString("en", {
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
        ------------------------------------------
      </Typography>
      <Barcode
        value={invoiceData.invoiceNumber}
        height={40}
        displayValue={false}
      />
      <Typography align="center">¡Gracias por su compra!</Typography>
    </Box>
  );
});

export default Receipt;
