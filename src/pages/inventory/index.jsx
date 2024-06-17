import React from 'react'
import { Box, FormControl, IconButton, InputBase, InputLabel, MenuItem, Select, Button, TextField, Typography, useTheme } from "@mui/material";
import Header from '../../components/Header';
import { tokens } from '../../theme';
import { mockDataInvoices } from "../../data/mockData";
import { DataGrid} from '@mui/x-data-grid';

const Inventory = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


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
    ];
    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography fontSize={32} fontWeight={"bold"}>Inventario</Typography>
                    
                    <Box display="flex" alignItems="center">
                        <Typography color={colors.greenAccent[500]} fontSize={15}>Hacer clic en la fila para ver detalles del producto.</Typography>
                    </Box>
                </Box>
                <Box
                    p={0.2}
                    borderRadius={2}
                    >
                    <Button type="button" color="secondary" variant="contained">
                        Agregar Producto
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
                <DataGrid rows={mockDataInvoices} columns={_columns} />
            </Box>
        </Box>
    )
}

export default Inventory