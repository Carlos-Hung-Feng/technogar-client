import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  Select,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  Button,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import Header from "../../components/Header";
import { PaymentMethodAPI } from "../../api/services/PaymentMethodAPI";
import { SupplierAPI } from "../../api/services/SupplierAPI";
import { UserAPI } from "../../api/services/UserAPI";
import { WarehouseAPI } from "../../api/services/WarehouseAPI";
import { ProductAPI } from "../../api/services/ProductAPI";
import { PurchaseOrderAPI } from "../../api/services/PurchaseOrderAPI";
import { Link } from "react-router-dom";

const Order = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const userId = localStorage.getItem("userId");

  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  const [productBasicInfoList, setProductBasicInfoList] = useState([]);
  const [filteredProductBasicInfoList, setFilteredProductBasicInfoList] =
    useState([]);
  const [addedProductList, setAddedProductList] = useState([]);
  const [productButtonText, setProductButtonText] =
    useState("AGREGAR PRODUCTO");
  const [oldProductQuantity, setOldProductQuantity] = useState(0);
  let currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const [file, setFile] = useState(null);

  const [formValues, setFormValues] = useState({
    id: "",
    orderNumber: "",
    supplier: "",
    telephone: "",
    paymentMethod: "",
    tax: 0,
    warehouse: "",
    freight: 0,
    documentName: "",
    shippingAddress: "",
    note: "",
    orderedBy: "",
    receivedBy: "",
    orderedDate: "",
    receivedDate: "",
    product: null,
    quantity: "",
    cost: "",
    searchPurchaseOrderParam: "",
    oldDocumentId: "",
  });

  useEffect(() => {
    PaymentMethodAPI.getAll()
      .then((data) => {
        setPaymentMethodList([...data.data]);
      })
      .catch((err) => {
        console.error("No se pudo obtener los metodos de pagos", err);
      });

    SupplierAPI.getAll()
      .then((data) => {
        setSupplierList([...data.data]);
      })
      .catch((err) => {
        console.error("No se pudo obtener los proveedores", err);
      });

    UserAPI.getAll()
      .then((data) => {
        setUserList([...data]);
        setFormValues({ ...formValues, orderedBy: userId });
      })
      .catch((err) => {
        console.error("No se pudo obtener los usuarios", err);
      });

    WarehouseAPI.getAll()
      .then((data) => {
        setWarehouseList([...data.data]);
      })
      .catch((err) => {
        console.error("No se pudo obtener los almacenes", err);
      });

    ProductAPI.getAllProductsBasicInfo()
      .then((data) => {
        setProductBasicInfoList([...data]);
      })
      .catch((err) => {
        console.error("No se pudo obtener los almacenes", err);
      });
  }, []);

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type === "file") {
      // Si es un archivo, guardarlo como parte del estado
      setFile(e.target.files[0]);
    }

    let supplierPhoneNumber = "";
    if (name === "supplier") {
      setFilteredProductBasicInfoList(
        productBasicInfoList.filter((x) => x.supplierId === value)
      );
      supplierPhoneNumber = supplierList.find((x) => x.id === value).attributes
        .Telephone;
      setAddedProductList([]);
    }

    if (supplierPhoneNumber !== "") {
      setFormValues({
        ...formValues,
        [name]: value,
        telephone: supplierPhoneNumber,
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  const handleCheckOrderNumber = () => {
    if (formValues.id !== "") return;

    PurchaseOrderAPI.getOrderByOrderNumber(formValues.orderNumber).then(
      (response) => {
        if (response !== undefined) {
          alert(
            "Número de orden ya utilizada, por favor intenta con otro número (puede ser agregando un 0 al final)."
          );
          setFormValues({
            ...formValues,
            orderNumber: "",
          });
        }
      }
    );
  };

  const handleProductChange = (event, value) => {
    setFormValues({
      ...formValues,
      product: value,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (addedProductList.length === 0) {
      alert("El orden debe tener al menos un producto");
      return;
    }

    //let order = { ...formValues, products: addedProductList };
    if (formValues.id === "") {
      PurchaseOrderAPI.create(formValues)
        .then((data) => {
          setFormValues({
            ...formValues,
            id: data.data.id,
          });
          if (file !== null) {
            PurchaseOrderAPI.uploadFile(file, data.data.id);
          }

          addedProductList.forEach((product) => {
            savePurchaseOrderProduct(
              product,
              data.data.id,
              formValues.warehouse
            );
          });
          alert("Orden creado exitosamente");
        })
        .catch((err) => alert("No se pudo crear el orden", err));
    } else {
      PurchaseOrderAPI.update(formValues)
        .then((data) => {
          if (file !== null) {
            if (formValues.oldDocumentId !== null) {
              PurchaseOrderAPI.deleteFile(formValues.oldDocumentId);
            }
            PurchaseOrderAPI.uploadFile(file, data.data.id);
          }
          alert("Orden actualizado exitosamente");
        })
        .catch((err) => alert("No se pudo actualizar el orden", err));
    }
  };

  const savePurchaseOrderProduct = (
    _orderProduct,
    _purchaseOrderId,
    _warehouseId
  ) => {
    PurchaseOrderAPI.addOrderProduct(_purchaseOrderId, _orderProduct).then(
      (data) => {
        _orderProduct.id = data.data.id;
        WarehouseAPI.getByWarehouseIdAndProductId(
          _warehouseId,
          _orderProduct.productId
        ).then((warehouse) => {
          if (warehouse.data.length > 0) {
            let inventory = {
              id: warehouse.data[0].id,
              warehouse: warehouse.data[0].attributes.Warehouse.data.id,
              product: warehouse.data[0].attributes.Product.data.id,
              quantity:
                parseInt(warehouse.data[0].attributes.Quantity) +
                parseInt(_orderProduct.quantity),
            };
            WarehouseAPI.updateInventory(inventory);
          } else {
            let inventory = {
              warehouse: _warehouseId,
              product: _orderProduct.productId,
              quantity: _orderProduct.quantity,
            };
            WarehouseAPI.createInventory(inventory);
          }
        });
      }
    );
  };

  const getOrderByOrderNumber = () => {
    PurchaseOrderAPI.getOrderByOrderNumber(formValues.searchPurchaseOrderParam)
      .then((response) => {
        setFormValues(response);
        setFilteredProductBasicInfoList(
          productBasicInfoList.filter((x) => x.supplierId === response.supplier)
        );
        setAddedProductList(response.purchaseOrder_Products);
      })
      .catch((err) =>
        console.error("No se pudo obtener el orden de compra", err)
      );
  };

  const addProduct = (_orderProduct, _quantity, _cost) => {
    if (_orderProduct === null || _quantity === "" || _cost === "") {
      return;
    }
    if (
      _orderProduct === undefined ||
      _quantity === undefined ||
      _cost === undefined
    ) {
      return;
    }

    let orderProduct = {
      id: _orderProduct.id,
      productId: _orderProduct.productId,
      barCode: _orderProduct.barCode,
      name: _orderProduct.name,
      quantity: _quantity,
      cost: _cost,
      subtotal: _quantity * _cost,
    };

    if (formValues.id !== "") {
      if (productButtonText === "AGREGAR PRODUCTO") {
        savePurchaseOrderProduct(
          orderProduct,
          formValues.id,
          formValues.warehouse
        );
      } else {
        let quantity = _quantity - oldProductQuantity;
        PurchaseOrderAPI.updateOrderProduct(formValues.id, orderProduct).then(
          (data) => {
            WarehouseAPI.getByWarehouseIdAndProductId(
              formValues.warehouse,
              _orderProduct.productId
            ).then((warehouse) => {
              if (warehouse.data.length > 0) {
                let inventory = {
                  id: warehouse.data[0].id,
                  warehouse: warehouse.data[0].attributes.Warehouse.data.id,
                  product: warehouse.data[0].attributes.Product.data.id,
                  quantity: warehouse.data[0].attributes.Quantity + quantity,
                };
                WarehouseAPI.update(inventory);
              } else {
                let inventory = {
                  warehouse: formValues.warehouse,
                  product: _orderProduct.productId,
                  quantity: _orderProduct.quantity,
                };
                WarehouseAPI.create(inventory);
              }
            });
          }
        );
      }
    }

    if (addedProductList.find((x) => x.id === _orderProduct.id)) {
      let updatedList = addedProductList.map((item) =>
        item.productId === _orderProduct.productId
          ? {
              ...item,
              quantity: _quantity,
              cost: _cost,
              subtotal: _quantity * _cost,
            }
          : item
      );
      setAddedProductList(updatedList);
      setFormValues({ ...formValues, product: null, quantity: "", cost: "" });
      setProductButtonText("AGREGAR PRODUCTO");
    } else {
      setAddedProductList([...addedProductList, orderProduct]);
      setFormValues({ ...formValues, product: null, quantity: "", cost: "" });
      setProductButtonText("AGREGAR PRODUCTO");
    }
  };

  const deleteProduct = (_orderProduct) => {
    if (formValues.id !== "") {
      WarehouseAPI.getByWarehouseIdAndProductId(
        formValues.warehouse,
        _orderProduct.row.productId
      ).then((data) => {
        let updatedInventory = {
          id: data.data[0].id,
          warehouse: formValues.warehouse,
          product: _orderProduct.row.productId,
          quantity:
            data.data[0].attributes.Quantity - _orderProduct.row.quantity,
        };
        WarehouseAPI.update(updatedInventory).then((data) => {
          PurchaseOrderAPI.deleteOrderProduct(_orderProduct.row.id);
        });
      });
    }
    setAddedProductList(
      addedProductList.filter(
        (product) => product.productId !== _orderProduct.row.productId
      )
    );
    setProductButtonText("AGREGAR PRODUCTO");
  };

  const editProduct = (_orderProduct) => {
    setOldProductQuantity(_orderProduct.row.quantity);
    let data = addedProductList.find(
      (x) => x.productId === _orderProduct.row.productId
    );
    setProductButtonText("Editar Producto");
    setFormValues({
      ...formValues,
      product: data,
      quantity: data.quantity,
      cost: data.cost,
    });
  };

  const calculateSubtotalSum = () => {
    let sum = 0;
    addedProductList.forEach((product) => {
      sum += product.subtotal;
    });
    return currencyFormat.format(sum);
  };

  const COLUMNS = [
    { field: "barCode", headerName: "Código", flex: 1 },
    {
      field: "name",
      headerName: "Nombre",
      cellClassName: "name-column--cell",
      flex: 1,
    },
    { field: "quantity", headerName: "Cantidad", flex: 1 },
    {
      field: "cost",
      headerName: "Costo",
      renderCell: ({ row: { cost } }) => {
        return (
          <Typography color={colors.blueAccent[500]}>
            {currencyFormat.format(cost)}
          </Typography>
        );
      },
      flex: 1,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      renderCell: ({ row: { subtotal } }) => {
        return (
          <Typography color={colors.blueAccent[500]}>
            {currencyFormat.format(subtotal)}
          </Typography>
        );
      },
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditOutlinedIcon />}
          label="Editar"
          onClick={() => editProduct(params)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon />}
          label="Borrar"
          onClick={() => deleteProduct(params)}
          showInMenu
        />,
      ],
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={"-15px"}
      >
        <Header
          title="Ordenar"
          subtitle={
            formValues.id !== ""
              ? `Actualizando información del orden (${formValues.orderNumber})`
              : "Gestión de Orden"
          }
        />
        <Box
          display="flex"
          backgroundColor={colors.primary[400]}
          p={0.2}
          borderRadius={2}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            name="searchPurchaseOrderParam"
            placeholder="Buscar orden"
            onChange={handleInputChange}
            value={formValues.searchPurchaseOrderParam || ""}
          />
          <IconButton type="button" onClick={getOrderByOrderNumber}>
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
          <form onSubmit={handleFormSubmit}>
            <Box display="grid" gap={"30px"} gridTemplateColumns="1fr 1fr">
              <Box
                display={"grid"}
                gap={"30px"}
                gridTemplateColumns={"1fr 1fr"}
              >
                <TextField
                  variant="filled"
                  type="text"
                  label="Numero del orden"
                  onChange={handleInputChange}
                  onBlur={handleCheckOrderNumber}
                  name="orderNumber"
                  value={formValues.orderNumber || ""}
                  inputProps={formValues.id !== "" ? { readOnly: true } : {}}
                  required
                />
                <FormControl
                  variant="filled"
                  sx={{ minWidth: 120, width: "100%" }}
                >
                  <InputLabel id="lblPaymentMethod">Método de Pago*</InputLabel>
                  <Select
                    labelId="lblPaymentMethod"
                    id="sltPaymentMethod"
                    name="paymentMethod"
                    value={formValues.paymentMethod || ""}
                    onChange={handleInputChange}
                    required
                  >
                    {paymentMethodList.map((method) => (
                      <MenuItem key={method.id} value={method.id}>
                        {method.attributes.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  variant="filled"
                  sx={{ minWidth: 120, width: "100%" }}
                >
                  <InputLabel id="lblSupplier">Proveedor*</InputLabel>
                  <Select
                    labelId="lblSupplier"
                    id="sltSupplier"
                    name="supplier"
                    value={formValues.supplier || ""}
                    onChange={handleInputChange}
                    inputProps={formValues.id !== "" ? { readOnly: true } : {}}
                    required
                  >
                    {supplierList.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.attributes.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  variant="filled"
                  type="text"
                  label="Teléfono"
                  onChange={handleInputChange}
                  name="telephone"
                  value={formValues.telephone || ""}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Dirección de Envío"
                  onChange={handleInputChange}
                  name="shippingAddress"
                  value={formValues.shippingAddress || ""}
                  multiline
                  rows={5}
                  required
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Nota"
                  onChange={handleInputChange}
                  name="note"
                  value={formValues.note || ""}
                  multiline
                  rows={5}
                />
              </Box>
              <Box>
                <Box
                  display={"grid"}
                  gap={"30px"}
                  gridTemplateColumns={"1fr 1fr"}
                >
                  <TextField
                    variant="filled"
                    type="number"
                    label="Impuesto"
                    onChange={handleInputChange}
                    name="tax"
                    value={formValues.tax || 0}
                  />
                  <TextField
                    variant="filled"
                    type="number"
                    label="Flete"
                    onChange={handleInputChange}
                    name="freight"
                    value={formValues.freight || 0}
                  />
                  <FormControl
                    variant="filled"
                    sx={{ minWidth: 120, width: "100%" }}
                  >
                    <InputLabel id="lblWarehouse">Almacén*</InputLabel>
                    <Select
                      labelId="lblWarehouse"
                      id="sltWarehouse"
                      name="warehouse"
                      value={formValues.warehouse || ""}
                      onChange={handleInputChange}
                      inputProps={
                        formValues.id !== "" ? { readOnly: true } : {}
                      }
                      required
                    >
                      {warehouseList.map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.attributes.Name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    variant="filled"
                    type="file"
                    label="Documento"
                    onChange={handleInputChange}
                    name="documentName"
                    value={formValues.documentName || ""}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <FormControl
                    variant="filled"
                    sx={{ minWidth: 120, width: "100%" }}
                  >
                    <InputLabel id="lblOrderedBy">Ordenado Por*</InputLabel>
                    <Select
                      labelId="lblOrderedBy"
                      id="sltOrderedBy"
                      name="orderedBy"
                      value={formValues.orderedBy || ""}
                      onChange={handleInputChange}
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {userList.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    variant="filled"
                    type="date"
                    label="Fecha de Pedido"
                    onChange={handleInputChange}
                    name="orderedDate"
                    value={formValues.orderedDate || ""}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Box>
              </Box>
            </Box>

            <Box
              backgroundColor={colors.primary[400]}
              borderRadius="10px"
              mt="20px"
            >
              {formValues.id !== "" ? (
                <Typography
                  variant="h4"
                  color={colors.greenAccent[500]}
                  sx={{ mb: 2 }}
                >
                  Editar Productos &#40;Los cambios se guardan al instante&#41;
                </Typography>
              ) : (
                <Typography
                  variant="h4"
                  color={colors.greenAccent[500]}
                  sx={{ mb: 2 }}
                >
                  Agregar Productos
                </Typography>
              )}

              <Box
                display="grid"
                gap={"30px"}
                gridTemplateColumns="repeat(12, 1fr)"
              >
                <Box gridColumn="span 3">
                  <Autocomplete
                    options={filteredProductBasicInfoList}
                    getOptionLabel={(option) =>
                      `${option.barCode} - ${option.name}`
                    }
                    isOptionEqualToValue={(option, value) => {
                      return option.id === value.productId;
                    }}
                    value={formValues.product || null}
                    onChange={handleProductChange}
                    readOnly={
                      productButtonText !== "AGREGAR PRODUCTO" ? true : false
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Producto"
                        variant="filled"
                      />
                    )}
                  />
                </Box>
                <Box gridColumn="span 3">
                  <TextField
                    sx={{ width: "100%" }}
                    variant="filled"
                    type="number"
                    label="Cantidad"
                    name="quantity"
                    value={formValues.quantity || ""}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box gridColumn="span 3">
                  <TextField
                    sx={{ width: "100%" }}
                    variant="filled"
                    type="number"
                    label="Costo"
                    name="cost"
                    value={formValues.cost || ""}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box
                  gridColumn="span 3"
                  display={"flex"}
                  justifyContent={"flex-end"}
                >
                  <Button
                    color={
                      productButtonText === "AGREGAR PRODUCTO"
                        ? "info"
                        : "warning"
                    }
                    disabled={
                      formValues.product === null ||
                      formValues.quantity === "0" ||
                      formValues.quantity === "" ||
                      formValues.cost === ""
                    }
                    variant="contained"
                    onClick={() =>
                      addProduct(
                        formValues.product,
                        formValues.quantity,
                        formValues.cost
                      )
                    }
                    fullWidth
                  >
                    {productButtonText}
                  </Button>
                </Box>
              </Box>
              <Box mt="20px" height="40vh">
                <DataGrid
                  rows={addedProductList}
                  columns={COLUMNS}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                />
              </Box>
            </Box>
            <Box display={"flex"} justifyContent={"end"}>
              <Typography
                sx={{
                  fontSize: "35px",
                  fontWeight: "bold",
                }}
              >
                Total: {calculateSubtotalSum()}
              </Typography>
            </Box>
            <Box mt="20px" display="flex" justifyContent="flex-end" gap={2}>
              <Button type="button" color="error" variant="contained">
                Cancelar
              </Button>
              <Button
                type="submit"
                color={formValues.id === "" ? "secondary" : "warning"}
                variant="contained"
              >
                {formValues.id === "" ? "Crear" : "Actualizar"}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Order;
