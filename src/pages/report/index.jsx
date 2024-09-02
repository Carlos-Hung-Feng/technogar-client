import { React, useState, useEffect } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import * as XLSX from "xlsx";
import { DataGrid } from "@mui/x-data-grid";
import { ProductAPI } from "../../api/services/ProductAPI";
import { InvoiceAPI } from "../../api/services/InvoiceAPI";
import { CreditNoteAPI } from "../../api/services/CreditNoteAPI";

const Report = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [ncfList, setNcfList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const date = new Date();
    const date1 = `${date.getFullYear()}-${
      date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth()
    }-01`;
    date.setMonth(date.getMonth() + 1, 1);
    const date2 = `${date.getFullYear()}-${
      date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth()
    }-01`;

    InvoiceAPI.getNCFInvoicesByDates(date1, date2)
      .then((invoices) => {
        CreditNoteAPI.getNCFCreditNotesByDates(date1, date2)
          .then((creditNotes) => {
            // Manejar la respuesta de éxito
            const list = invoices.concat(creditNotes);
            setNcfList([...list]);
          })
          .catch((err) => {
            // Manejar el error
            console.error("No se pudo obtener los productos", err);
            setError("No se pudo obtener los productos");
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((err) => {
        // Manejar el error
        console.error("No se pudo obtener los productos", err);
        setError("No se pudo obtener los productos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(ncfList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, "Facturas.xlsx");
  };

  const _columns = [
    {
      field: "NCF",
      headerName: "NCF",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "ITBIS",
      headerName: "ITBIS",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "Total",
      headerName: "Total",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "CreatedAt",
      headerName: "Fecha",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
  ];
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontSize={32} fontWeight={"bold"}>
            Reporte
          </Typography>

          <Box display="flex" alignItems="center">
            <Typography color={colors.greenAccent[500]} fontSize={15}>
              Reporte de las facturas con RNC.
            </Typography>
          </Box>
        </Box>
        <Box p={0.2} borderRadius={2}>
          <Button
            type="button"
            color="secondary"
            variant="contained"
            onClick={downloadExcel}
          >
            Exportar Excel
          </Button>
        </Box>
      </Box>

      <Box
        gap={2}
        m="8px 0 0 0"
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiChackbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={ncfList}
          columns={_columns}
          getRowId={() => Math.random()}
        />
      </Box>
    </Box>
  );
};

export default Report;
