import React from "react";
import { Box, Typography } from "@mui/material";

const CashCountReceipt = React.forwardRef(({ cashCountData }, ref) => {
  if (!cashCountData) {
    return null; // Maneja el caso en que no se haya pasado cashCountData
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
      <Typography>Fech de cuadre de caja:</Typography>
      <Typography>{new Date().toLocaleString()}</Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Typography align="center" fontWeight={"bold"} fontSize={"20px"}>
        Cuadre de caja
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Box display={"grid"} gridTemplateColumns={"1fr 2fr 1fr"}>
        <Typography>Pago</Typography>
        <Typography align="center">Cant.</Typography>
        <Typography align="right">Subtotal</Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      {cashCountData.invoiceCount.map((invoice, index) => (
        <Box key={index}>
          <Box display={"grid"} gridTemplateColumns={"2fr 1fr 2fr"}>
            <Typography fontSize={"11px"}>
              {invoice.paymentMethodName}
            </Typography>
            <Typography align="center" fontSize={"11px"}>
              {invoice.count}
            </Typography>
            <Typography align="right" fontSize={"11px"}>
              {invoice.subtotal.toLocaleString("en", {
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
        <Typography fontWeight={"bold"}>Total:</Typography>
        <Typography fontWeight={"bold"}>
          {cashCountData.total.toLocaleString("en", {
            minimumFractionDigits: 2,
          })}
        </Typography>
      </Box>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Typography fontSize={"12px"}>
        Recibo generado para el cierre de caja. Verifique los montos y asegúrese
        de que todo esté en orden. ¡Gracias por su dedicación y buen trabajo!
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
    </Box>
  );
});

export default CashCountReceipt;
