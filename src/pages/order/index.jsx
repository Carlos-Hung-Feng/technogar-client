import { Box, FormControl, IconButton, InputBase, InputLabel, Select, TextField, Typography, useTheme, MenuItem, useMediaQuery, Button } from '@mui/material';
import React from 'react'
import { tokens } from '../../theme';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from "@mui/icons-material/Search";  
import Header from '../../components/Header';
import * as yup from 'yup';
import { Formik } from 'formik';

const mockDataOrderProducts = []

const Order = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
    const handleFormSubmit = (values) => {
        console.log(values);
    };
    const initialValues = {
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        address1: "",
        address2: "",
    };
    const checkoutSchema = yup.object().shape({
        firstName:yup.string().required("Required"),
        lastName:yup.string().required("Required"),
        email:yup.string().email("Invalid email!").required("Required"),
        contact:yup.string().matches(phoneRegExp, "phone number is not valid!").required("Required"),
        address1:yup.string().required("Required"),
        address2:yup.string().required("Required"),

    })

    const deleteProduct = (id) => {

    }


    const editProduct = (id) => {

    }

    const _columns = [
        { field: "quantity", headerName: "Cantidad" },
        {
            field: "description",
            headerName: "Descripcion",
            width: 1000,
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
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={'-15px'}>
                <Header title="Ordenar" subtitle="Aqui presenta el numero del orden de compra en caso de que este buscando."/>
                <Box
                display="flex"
                backgroundColor={colors.primary[400]}
                p={0.2}
                borderRadius={2}
                >
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Buscar orden" />
                <IconButton type="button">
                    <SearchIcon />
                </IconButton>
                </Box>
            </Box>
            <Box
                gap={2}
                m="8px 0 0 0"
                height="50vh"
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
                <Box
                    marginBottom={2}
                    backgroundColor={colors.primary[400]}
                    p="15px"
                    borderRadius="10px"
                >
                    {/* <Box display={'flex'} alignItems={'center'} gap={2}>
                    <h1>Total:</h1>
                    <h1>0.00</h1>
                    </Box> */}
                    {/* <FormControl variant="filled" sx={{minWidth: 120, width: '100%' }}>
                    <InputLabel id="lblPaymentMethod">Metodo</InputLabel>
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
                    </FormControl> */}
                    <Formik onSubmit={handleFormSubmit} initialValues={initialValues} validationSchema={checkoutSchema}>
                    {({ values, errors, touched, handleBlur, handleChange, handleSubmit,}) => (
                        <form onSubmit={handleSubmit}>
                            <Box
                            display="grid"
                            gap={"30px"}
                            gridTemplateColumns="1fr 1fr"
                            >
                                <Box
                                display={"grid"}
                                gap={"30px"}
                                gridTemplateColumns={"1fr 1fr"}
                                >
                                    <TextField
                                        variant="filled"
                                        type="number"
                                        label="ID del orden"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="orderID"
                                    />
                                    <TextField
                                        variant="filled"
                                        type="text"
                                        label="Numero del orden"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="orderNumber"
                                    />
                                    <FormControl variant="filled" sx={{minWidth: 120, width: '100%' }}>
                                        <InputLabel id="lblSupplier">Proveedor</InputLabel>
                                        <Select
                                            labelId="lblSupplier"
                                            id="sltSupplier"
                                            // value={age}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="">
                                            <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={1}>Proveedor 01</MenuItem>
                                            <MenuItem value={2}>Proveedor 02</MenuItem>
                                            <MenuItem value={3}>Proveedor 03</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl variant="filled" sx={{minWidth: 120, width: '100%' }}>
                                        <InputLabel id="lblPaymentMethod">Método de Pago</InputLabel>
                                        <Select
                                            labelId="lblPaymentMethod"
                                            id="sltPaymentMethod"
                                            // value={age}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
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
                                        variant="filled"
                                        type="number"
                                        label="Impuesto / Gestión"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="tax"
                                    />
                                    <TextField
                                        variant="filled"
                                        type="text"
                                        label="Almacen"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="warehouse"
                                    />
                                    <TextField
                                        variant="filled"
                                        type="number"
                                        label="Flete"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="freight"
                                    />
                                    <TextField //
                                        variant="filled"
                                        type="file"
                                        label="Documento"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="document"
                                    />
                                    <TextField // Text Area or rich text box
                                        variant="filled"
                                        type="text"
                                        label="Dirección de Envío"
                                        multiline
                                        rows={6}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="shippingAddress"
                                    />
                                    <TextField // Text Area or rich text box
                                        variant="filled"
                                        type="text"
                                        label="Nota"
                                        multiline
                                        rows={6}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="note"
                                    />
                                </Box>
                                <Box
                                display={"flex"}
                                flexDirection={'column'}
                                gap={"30px"}
                                minWidth={'200px'}
                                >
                                    <Box
                                    display={"grid"}
                                    gap={"30px"}
                                    gridTemplateColumns={"1fr 1fr"}
                                    >
                                        <FormControl variant="filled" sx={{minWidth: 120, width: '100%' }}>
                                            <InputLabel id="lblOrderedBy">Ordenado por</InputLabel>
                                            <Select
                                                labelId="lblOrderedBy"
                                                id="sltOrderedBy"
                                                // value={age}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="">
                                                <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={1}>Usuario 01</MenuItem>
                                                <MenuItem value={2}>Usuario 02</MenuItem>
                                                <MenuItem value={3}>Usuario 03</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl variant="filled" sx={{minWidth: 120, width: '100%' }}>
                                            <InputLabel id="lblReceivedBy">Recibido por</InputLabel>
                                            <Select
                                                labelId="lblReceivedBy"
                                                id="sltReceivedBy"
                                                // value={age}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="">
                                                <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={1}>Usuario 01</MenuItem>
                                                <MenuItem value={2}>Usuario 02</MenuItem>
                                                <MenuItem value={3}>Usuario 03</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            variant="filled"
                                            type="date"
                                            label="Fecha de Emisión"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            name="orderedDate"
                                        />
                                        <TextField
                                            variant="filled"
                                            type="date"
                                            label="Fecha de Recepción"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            name="receivedDate"
                                        />
                                    </Box>
                                    <TextField
                                    variant="filled"
                                    type="text"
                                    label="Nombre del producto"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    name="product"
                                    />
                                    <TextField
                                        variant="filled"
                                        type="number"
                                        label="Cantidad"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="quantity"
                                    />
                                    <TextField
                                        variant="filled"
                                        type="number"
                                        label="Precui"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        name="price"
                                    />
                                    <Typography fontSize={40} fontWeight={'bold'}>
                                        Total: 0.00
                                    </Typography>
                                    
                                    {/* <TextField
                                        variant="filled"
                                        type="text"
                                        label="Contact Number"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.contact}
                                        name="contact"
                                        error={!!touched.contact && !!errors.contact}
                                        helperText={touched.contact && errors.contact}
                                    />
                                    <TextField
                                        variant="filled"
                                        type="text"
                                        label="Address 1"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.address1}
                                        name="address1"
                                        error={!!touched.address1 && !!errors.address1}
                                        helperText={touched.address1 && errors.address1}
                                    />
                                    <TextField
                                        variant="filled"
                                        type="text"
                                        label="Address 2"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.address2}
                                        name="address2"
                                        error={!!touched.address2 && !!errors.address2}
                                        helperText={touched.address2 && errors.address2}
                                    /> */}
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="end" mt="20px">
                                <Button type="button" color="info" variant="contained">
                                    Agregar Producto
                                </Button>
                            </Box>
                        </form>
                        )}
                    </Formik>
                </Box>
                <DataGrid rows={mockDataOrderProducts} columns={_columns} />
                <Box display="flex" justifyContent="end" mt="20px" gap={2}>
                    <Button type="button" color="error" variant="contained">
                        Cancelar
                    </Button>
                    <Button type="button" color="secondary" variant="contained">
                        Guardar
                    </Button>
                </Box>
                <Box height={"20px"}></Box>
                {/* <Box>
                    
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
                </Box> */}
            </Box>
        </Box>
    )
}

export default Order


{/* <TextField
    variant="filled"
    type="text"
    label="First Name"
    onBlur={handleBlur}
    onChange={handleChange}
    value={values.firstName}
    name="firstName"
    error={!!touched.firstName && !!errors.firstName}
    helperText={touched.firstName && errors.firstName}
    />
    <TextField
        variant="filled"
        type="text"
        label="Last Name"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.lastName}
        name="lastName"
        error={!!touched.lastName && !!errors.lastName}
        helperText={touched.lastName && errors.lastName}
        
    />
    <TextField
        variant="filled"
        type="text"
        label="Email"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.email}
        name="email"
        error={!!touched.email && !!errors.email}
        helperText={touched.email && errors.email}
    />
    <TextField
        variant="filled"
        type="text"
        label="Contact Number"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.contact}
        name="contact"
        error={!!touched.contact && !!errors.contact}
        helperText={touched.contact && errors.contact}
    />
    <TextField
        variant="filled"
        type="text"
        label="Address 1"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.address1}
        name="address1"
        error={!!touched.address1 && !!errors.address1}
        helperText={touched.address1 && errors.address1}
    />
    <TextField
        variant="filled"
        type="text"
        label="Address 2"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.address2}
        name="address2"
        error={!!touched.address2 && !!errors.address2}
        helperText={touched.address2 && errors.address2}
    /> */}