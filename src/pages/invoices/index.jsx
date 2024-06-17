import React from "react";
import { Box, FormControl, IconButton, InputBase, InputLabel, MenuItem, Select, Button, TextField, Typography, useTheme } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataInvoices } from "../../data/mockData";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from "@mui/icons-material/Search";  

import Header from "../../components/Header";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const deleteProduct = (id) => {

  }

  
  const editProduct = (id) => {

  }

  // const columns = [
  //   { field: "id", headerName: "Id" },
  //   {
  //     field: "name",
  //     headerName: "Name",
  //     width: 200,
  //     cellClassName: "name-column--cell",
  //   },
  //   { field: "email", headerName: "Email", width: 200 },
  //   { field: "phone", headerName: "Phone Number", width: 100 },

  //   {
  //     field: "cost",
  //     headerName: "Cost",
  //     width: 100,
  //     renderCell: ({ row: { cost } }) => {
  //       return <Typography color={colors.greenAccent[500]}>${cost}</Typography>;
  //     },
  //   },
  //   { field: "date", headerName: "Date", width: 100 },
  // ];

  const _columns = [
    { field: "quantity", headerName: "Cantidad" },
    {
      field: "description",
      headerName: "Descripcion",
      width: 650,
      cellClassName: "name-column--cell",
    },
    {
      field: "cost",
      headerName: "Cost",
      width: 100,
      renderCell: ({ row: { cost } }) => {
        return <Typography color={colors.greenAccent[500]}>${cost}</Typography>;
      },
    },
    { field: "subtotal", headerName: "Subtotal"},
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Editar"
          onClick={editProduct(params.id)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon />}
          label="Borrar"
          onClick={deleteProduct(params.id)}
          showInMenu
        />
        // <GridActionsCellItem
        //   icon={<FileCopyIcon />}
        //   label="Duplicate User"
        //   onClick={duplicateUser(params.id)}
        //   showInMenu
        // />,
      ],
    },
  ];
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontSize={32} fontWeight={"bold"}>Facturar</Typography>
          
          <Box display="flex" alignItems="center">
            <IconButton type="button">
              <SearchIcon />
            </IconButton>
            <Typography color={colors.greenAccent[500]} fontSize={15}>Buscar RNC</Typography>
          </Box>
        </Box>
        <Box
          display="flex"
          backgroundColor={colors.primary[400]}
          p={0.2}
          borderRadius={2}
        >
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Buscar factura" />
          <IconButton type="button">
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>
      <Box
        display={'grid'}
        gridTemplateColumns={'3fr 1fr'}
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
        <DataGrid rows={mockDataInvoices} columns={_columns} />
        <Box>
          <Box
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="10px"
          >
            <Box display={'flex'} alignItems={'center'} justifyContent={"space-between"}>
              <h1>Total: 0.00</h1>
              <Button type="button" color="secondary" variant="contained">
                  Pagar
              </Button>
            </Box>
            <FormControl variant="filled" sx={{minWidth: 120, width: '100%' }}>
              <InputLabel id="lblPaymentMethod">Método de Pago</InputLabel>
              <Select
                labelId="lblPaymentMethod"
                id="sltPaymentMethod"
                // value={age}
                // onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={1}>Efectivo</MenuItem>
                <MenuItem value={2}>Tarjeta</MenuItem>
                <MenuItem value={3}>Transferencia</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              id="txtPayWith" 
              fullWidth
              type="number"
              label="Pagar con" 
              variant="filled"
              sx={{marginTop: '15px'}} />
            <FormControl variant="filled" sx={{minWidth: 120, width: '100%', marginTop: '15px'}}>
              <InputLabel id="lblDiscount">Descuento</InputLabel>
              <Select
                labelId="lblDiscount"
                id="sltDiscount"
                // value={age}
                // onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={1}>5%</MenuItem>
                <MenuItem value={2}>10%</MenuItem>
                <MenuItem value={3}>15%</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            marginTop={2}
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="10px"
          >
            <Box display={'flex'} alignItems={'center'} gap={2}>
              <h1>Precio:</h1>
              <h1>0.00</h1>
            </Box>
            <TextField 
              id="txtProductCode" 
              fullWidth
              type="text"
              label="Codigo" 
              variant="filled" />
            <TextField 
              id="txtQuantity" 
              fullWidth
              type="number"
              label="Cantidad" 
              variant="filled"
              sx={{marginTop: '15px'}} />
            <TextField 
              id="txtDescription" 
              fullWidth
              type="text"
              label="Descripcion" 
              variant="filled"
              sx={{marginTop: '15px'}} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Invoices;
