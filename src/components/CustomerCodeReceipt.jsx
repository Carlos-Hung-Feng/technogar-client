import React from "react";
import { Box, Typography } from "@mui/material";
import Barcode from "react-barcode";

const CustomerCodeReceipt = React.forwardRef(({ customerCodeData }, ref) => {
  if (!customerCodeData) {
    return null; // Maneja el caso en que no se haya pasado customerCodeData
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
      <Typography align="center" fontSize={"15px"}>
        Membresía
      </Typography>
      <Typography align="center" fontWeight={"bold"} fontSize={"30px"}>
        TechnoPlus
      </Typography>
      <Typography align="center">
        -------------------------------------------
      </Typography>
      {customerCodeData && (
        <Box display={"flex"} justifyContent={"center"}>
          <Barcode value={customerCodeData.code} />
        </Box>
      )}
      <Typography align="center">
        -------------------------------------------
      </Typography>
      <Typography fontSize={"12px"}>
        Este código es único para cada cliente. Recomendamos tomar una foto del
        código para evitar inconvenientes en caso de pérdida o daño del recibo.
      </Typography>

      <Typography fontWeight={"bold"} align="center" mt={1}>
        ¡Gracias por preferirnos!
      </Typography>
      <Typography>.</Typography>
    </Box>
  );
});

export default CustomerCodeReceipt;
