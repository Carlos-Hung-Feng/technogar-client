import React from "react";
import { Box, Typography } from "@mui/material";
import Barcode from "react-barcode";

const CreditNoteReceipt = React.forwardRef(({ invoiceData }, ref) => {
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
        <Typography fontWeight={"bold"} align="center" fontSize={"20px"}>
          TechnOgar.S.R.L
        </Typography>
        <Typography align="center">
          Av. San Vicente de Paul # 5, Alma Rosa I, Santo Domingo Este 11504
        </Typography>
        <Typography align="center">Tel: (829) 397-5667</Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>

      <Typography align="center" fontWeight={"bold"} fontSize={"18px"}>
        Nota de Crédito
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>

      <Typography fontWeight={"bold"}>
        NC #: {invoiceData.creditNoteNumber}
      </Typography>
      <Typography fontWeight={"bold"}>
        Factura #: {invoiceData.invoiceNumber}
      </Typography>
      <Typography>
        {new Date(invoiceData.createdAt).toLocaleString()}
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
        <Typography>Precio</Typography>
        <Typography align="center">Descuento</Typography>
        <Typography align="right">Subtotal</Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      {invoiceData.products.map((product, index) => (
        <Box key={index}>
          <Typography fontWeight={"bold"} fontSize={"11px"}>
            {product.barCode} - {product.name}
          </Typography>
          <Typography fontWeight={"bold"} fontSize={"11px"}>
            Razón de devolución: {product.returnReason}
          </Typography>
          <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
            <Typography fontSize={"11px"}>
              {product.price.toLocaleString("en", { minimumFractionDigits: 2 })}
            </Typography>
            <Typography align="center" fontSize={"11px"}>
              -
              {product.discount.toLocaleString("en", {
                minimumFractionDigits: 2,
              })}
            </Typography>
            <Typography align="right" fontSize={"11px"}>
              {product.subtotal.toLocaleString("en", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>
        </Box>
      ))}
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography fontWeight={"bold"} fontSize={"15px"}>
          Total:
        </Typography>
        <Typography fontWeight={"bold"} fontSize={"15px"}>
          {invoiceData.total.toLocaleString("en", { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      {invoiceData.creditNoteNumber && (
        <Barcode
          value={invoiceData.creditNoteNumber}
          height={40}
          displayValue={false}
        />
      )}
      <Typography fontSize={"10px"}>
        Esta nota de crédito debe aplicarse en su totalidad a una sola factura.
        No es posible dividir el monto para aplicarlo a múltiples facturas.
        Agradecemos su comprensión.
      </Typography>
      <Typography fontWeight={"bold"} align="center" mt={1}>
        ¡Gracias por elegirnos!
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
    </Box>
  );
});

export default CreditNoteReceipt;
