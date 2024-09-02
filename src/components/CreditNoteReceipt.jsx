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

      <Typography align="center" fontWeight={"bold"} fontSize={"18px"}>
        Nota de Crédito
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>

      <Typography fontWeight={"bold"}>
        NC #: {invoiceData.creditNoteNumber}
      </Typography>
      {invoiceData.creditNoteNCF && (
        <Box display={"flex"} gap={"3px"}>
          <Typography fontWeight={"bold"}>NCF: </Typography>
          <Typography>{invoiceData.creditNoteNCF}</Typography>
        </Box>
      )}
      {invoiceData.creditNoteCreatedAt && (
        <Typography>
          {new Date(invoiceData.creditNoteCreatedAt).toLocaleString()}
        </Typography>
      )}
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Typography fontWeight={"bold"}>
        Factura #: {invoiceData.invoiceNumber}
      </Typography>
      {invoiceData.invoiceNCF && (
        <Box display={"flex"} gap={"3px"}>
          <Typography fontWeight={"bold"}>NCF Mod. #:</Typography>
          <Typography>{invoiceData.invoiceNCF}</Typography>
        </Box>
      )}
      {invoiceData.invoiceCreatedAt && (
        <Typography>
          {new Date(invoiceData.invoiceCreatedAt).toLocaleString()}
        </Typography>
      )}
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
        <Typography>Precio</Typography>
        <Typography align="center">ITBIS</Typography>
        <Typography align="right">Valor*</Typography>
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
              {(
                Math.round((product.subtotal - product.subtotal / 1.18) * 100) /
                100
              ).toLocaleString("en", { minimumFractionDigits: 2 })}
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
      <Box
        display={"grid"}
        gridTemplateColumns={"1.5fr 2fr 1.5fr"}
        alignItems={"center"}
      >
        <Typography fontWeight={"bold"}>Total:</Typography>
        <Typography align="center" fontWeight={"bold"} fontSize={"11px"}>
          {(
            Math.round((invoiceData.total - invoiceData.total / 1.18) * 100) /
            100
          ).toLocaleString("en", { minimumFractionDigits: 2 })}
        </Typography>
        <Typography fontWeight={"bold"} align="right">
          {invoiceData.total.toLocaleString("en", { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Typography fontWeight={"bold"}>Nota:</Typography>
      <Typography fontSize={"10px"}>
        *Los montos reflejados son valores finales después de aplicar los
        descuentos correspondientes de la factura relacionada.
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Box mt={5}>
        <hr />
        <Typography align="center">Firma del emisor</Typography>
      </Box>
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
        ¡Gracias por preferirnos!
      </Typography>
      <Typography>.</Typography>
    </Box>
  );
});

export default CreditNoteReceipt;
