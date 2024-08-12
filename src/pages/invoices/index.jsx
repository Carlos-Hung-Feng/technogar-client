import { React, useEffect, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Button,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelIcon from "@mui/icons-material/Cancel";
import { PaymentMethodAPI } from "../../api/services/PaymentMethodAPI";
import { InvoiceDiscountAPI } from "../../api/services/InvoiceDiscountAPI";
import { ProductAPI } from "../../api/services/ProductAPI";
import { WarehouseAPI } from "../../api/services/WarehouseAPI";
import { InvoiceAPI } from "../../api/services/InvoiceAPI";
import Header from "../../components/Header";
import { ClientAPI } from "../../api/services/ClientAPI";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [addedProductList, setAddedProductList] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: false,
  });

  const [client, setClient] = useState({
    id: "",
    fullName: "",
    email: "",
    telephone: "",
    address: "",
    productPreferences: "",
    paymentMethod: "",
    identifier: "",
    lastPurchaseDate: "",
    note: "",
    customerType: "",
    links: "",
  });

  const [formValues, setFormValues] = useState({
    id: "",
    invoiceNumber: "",
    NIF: "",
    RNC: "",
    note: "",
    paidWith: "",
    returned: 0,
    status: "",
    paymentMethodId: "",
    customerId: "",
    billedById: "",
    discountId: "",

    productBarCode: "",
    quantity: 1,

    searchInvoiceParam: "",
    searchClientParam: "",
    searchRNCParam: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  let currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  useEffect(() => {
    setLoading(true);
    PaymentMethodAPI.getAll()
      .then((data) => {
        setPaymentMethodList([...data.data]);
      })
      .catch((err) => {
        setError("No se pudo obtener los métodos de pagos");
      })
      .finally(() => {
        setLoading(false);
      });

    InvoiceDiscountAPI.getAll()
      .then((data) => {
        setDiscountList([...data.data]);
      })
      .catch((err) => {
        setError("No se pudo obtener los descuentos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });

    name === "paidWith" ?? calculateChange(value);
    name === "discountId" ?? calculateTotal();

    if (name === "paymentMethodId") {
      if (value !== 1) {
        setFormValues({ ...formValues, paymentMethodId: value, paidWith: "" });
      }
    }
  };

  const invoiceNumberGenerator = () => {
    const invoiceNumber = Math.floor(Math.random() * 1e8)
      .toString()
      .padStart(8, "0");

    InvoiceAPI.getInvoiceByInvoiceNumber(invoiceNumber).then((data) => {
      if (data !== undefined) {
        invoiceNumberGenerator();
        return;
      }
    });

    return invoiceNumber;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí puedes manejar la lógica de envío del formulario

    if (formValues.paymentMethodId === "") {
      return;
    }
    if (addedProductList.length === 0) {
      alert("La factura debe tener al menos un producto");
      return;
    }

    let data = {
      ...formValues,
      invoiceNumber: invoiceNumberGenerator(),
      returned: formValues.paidWith - calculateTotal(),
      status: "Paid",
      billedById: parseInt(localStorage.getItem("userId")),
    };

    if (formValues.id === "") {
      InvoiceAPI.create(data)
        .then((data) => {
          setFormValues({
            ...formValues,
            id: data.data.id,
          });
          addedProductList.forEach((product) => {
            InvoiceAPI.addInvoiceProduct(data.data.id, product).then((data) => {
              WarehouseAPI.getByWarehouseIdAndProductId(
                1, // por ahora solo tenemos un almacen, y el usuario no esta relacionado con almacen (algo como sucursal, caja, etc.).
                product.productId
              ).then((warehouse) => {
                if (warehouse.data.length > 0) {
                  let inventory = {
                    id: warehouse.data[0].id,
                    warehouse: warehouse.data[0].attributes.Warehouse.data.id,
                    product: warehouse.data[0].attributes.Product.data.id,
                    quantity:
                      parseInt(warehouse.data[0].attributes.Quantity) -
                      parseInt(product.quantity),
                  };
                  WarehouseAPI.update(inventory);
                } else {
                  alert("Inventario no suficiente");
                }
                alert("Compra facturado exitosamente.");
              });
            });
          });
        })
        .catch((err) => {
          alert("No se pudo facturar la compra");
          console.error(err);
        });
    } else {
      data.status = "Canceled";
      InvoiceAPI.update(data)
        .then((data) => {
          addedProductList.forEach((product) => {
            WarehouseAPI.getByWarehouseIdAndProductId(
              1, // por ahora solo tenemos un almacen, y el usuario no esta relacionado con almacen (algo como sucursal, caja, etc.).
              product.productId
            ).then((warehouse) => {
              if (warehouse.data.length > 0) {
                let inventory = {
                  id: warehouse.data[0].id,
                  warehouse: warehouse.data[0].attributes.Warehouse.data.id,
                  product: warehouse.data[0].attributes.Product.data.id,
                  quantity:
                    parseInt(warehouse.data[0].attributes.Quantity) +
                    parseInt(product.quantity),
                };
                WarehouseAPI.update(inventory);
              } else {
                alert("Inventario no suficiente");
              }
              alert("Factura anulada exitosamente.");
            });
          });
        })
        .catch((err) => {
          alert("No se pudo anular la factura");
          console.error(err);
        });
    }
  };

  const getInvoiceByInvoiceNumber = () => {
    if (formValues.searchInvoiceParam === "") {
      return;
    }
    if (formValues.id === "") {
      InvoiceAPI.getInvoiceByInvoiceNumber(formValues.searchInvoiceParam)
        .then((response) => {
          if (response !== undefined) {
            setFormValues(response);
            setAddedProductList(response.invoice_Products);

            if (response.searchClientParam !== "") {
              ClientAPI.getClientByIdentifier(response.searchClientParam)
                .then((response) => {
                  if (response !== undefined) {
                    setClient(response);
                  } else {
                    alert(
                      "Número de identificación incorrecto, por favor intenta de nuevo."
                    );
                  }
                })
                .catch((err) => {
                  alert("No se pudo obtener informacion del cliente");
                  console.error(
                    "No se pudo obtener informacion del cliente",
                    err
                  );
                });
            }
          } else {
            alert("Número de factura incorrecta, por favor intenta de nuevo.");
          }
        })
        .catch((err) => {
          alert("No se pudo obtener la factura");
          console.error("No se pudo obtener la factura", err);
        });
    } else {
      setFormValues({
        id: "",
        invoiceNumber: "",
        NIF: "",
        RNC: "",
        note: "",
        paidWith: "",
        returned: 0,
        status: "",
        paymentMethodId: "",
        customerId: "",
        billedById: "",
        discountId: "",

        productBarCode: "",
        quantity: 1,

        searchInvoiceParam: "",
        searchClientParam: "",
        searchRNCParam: "",
      });

      setClient({
        id: "",
        fullName: "",
        email: "",
        telephone: "",
        address: "",
        productPreferences: "",
        paymentMethod: "",
        identifier: "",
        lastPurchaseDate: "",
        note: "",
        customerType: "",
        links: "",
      });
      setAddedProductList([]);
    }
  };

  const getClientByIdentifier = () => {
    if (formValues.searchClientParam === "") {
      return;
    }

    setAddedProductList([]);

    if (client.id === "") {
      ClientAPI.getClientByIdentifier(formValues.searchClientParam)
        .then((response) => {
          if (response !== undefined) {
            setClient(response);
            setFormValues({
              ...formValues,
              customerId: response.id,
            });
          } else {
            alert(
              "Número de identificación incorrecto, por favor intenta de nuevo."
            );
          }
        })
        .catch((err) => {
          alert("No se pudo obtener informacion del cliente");
          console.error("No se pudo obtener informacion del cliente", err);
        });
    } else {
      setClient({
        id: "",
        fullName: "",
        email: "",
        telephone: "",
        address: "",
        productPreferences: "",
        paymentMethod: "",
        identifier: "",
        lastPurchaseDate: "",
        note: "",
        customerType: "",
        links: "",
      });
      setFormValues({
        ...formValues,
        customerId: "",
        searchClientParam: "",
      });
    }
  };

  const addProduct = (e, editMode = false) => {
    if (e.key !== "Enter" || e.keyCode !== 13) {
      return;
    }

    if (formValues.productBarCode === "") {
      return;
    }

    let product = addedProductList.find(
      (x) => x.barCode === formValues.productBarCode
    );
    let price = 0;

    let quantity = parseInt(formValues.quantity);

    if (product !== undefined) {
      if (editMode) {
        product = {
          ...product,
          quantity: quantity,
          subtotal: quantity * product.price,
        };
      } else {
        product = {
          ...product,
          quantity: product.quantity + quantity,
          subtotal: (product.quantity + quantity) * product.price,
        };
      }

      // check inventory
      WarehouseAPI.getByWarehouseIdAndProductId(1, product.productId).then(
        (data) => {
          if (data.data[0].attributes.Quantity <= product.quantity) {
            alert(
              "Inventario insuficiente. Por favor, revise la disponibilidad."
            );
            return;
          } else {
            let updatedList = addedProductList.filter(
              (x) => x.productId !== product.productId
            );
            updatedList = [...updatedList, product];
            setAddedProductList(updatedList);
          }
        }
      );
    } else {
      ProductAPI.getProductByBarCode(formValues.productBarCode)
        .then((data) => {
          price = data.data[0].attributes.RetailPrice;

          if (client.id !== "") {
            price =
              client.customerType === "Wholesale"
                ? data.data[0].attributes.WholesalePrice
                : data.data[0].attributes.RetailPrice;
          }
          //TODO: validar si el cliente aplica el precio al por mayor (si no es cliente se le asigna el precio al detalle).
          product = {
            id: data.data[0].id,
            productId: data.data[0].id,
            barCode: data.data[0].attributes.BarCode,
            quantity: quantity,
            name: data.data[0].attributes.Name,
            description: data.data[0].attributes.Description,
            price: price,
            subtotal: quantity * price,
          };

          // check inventory
          WarehouseAPI.getByWarehouseIdAndProductId(1, product.productId).then(
            (data) => {
              if (data.data[0].attributes.Quantity <= product.quantity) {
                alert(
                  "Inventario insuficiente. Por favor, revise la disponibilidad."
                );
                return;
              } else {
                setAddedProductList([...addedProductList, product]);
              }
            }
          );
        })
        .catch((err) => {
          alert("No se pudo obtener los productos, por favor intenta de nueve");
          console.error("No se pudo obtener los productos", err);
        });
    }

    calculateTotal();
    clearFields();
  };

  const deleteProduct = (_id) => {
    // lógica para borrar producto
    setAddedProductList(
      addedProductList.filter((product) => product.productId !== _id)
    );
  };

  const editProduct = (_id) => {
    // lógica para editar producto
    let data = addedProductList.find((x) => x.id === _id);
    setFormValues({
      ...formValues,
      productBarCode: data.barCode,
      quantity: data.quantity,
    });
  };

  const clearFields = () => {
    setFormValues({
      ...formValues,
      productBarCode: "",
      quantity: 1,
    });
  };

  const _columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "barCode", headerName: "Código", flex: 1 },
    {
      field: "quantity",
      headerName: "Cantidad",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Nombre",
      cellClassName: "name-column--cell",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Descripción",
      width: 500,
    },
    {
      field: "price",
      headerName: "Precio",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { price } }) => {
        return (
          <Typography color={colors.blueAccent[500]}>
            {currencyFormat.format(price)}
          </Typography>
        );
      },
      flex: 1,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { subtotal } }) => {
        return (
          <Typography color={colors.greenAccent[500]}>
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
          onClick={() => editProduct(params.id)}
          showInMenu
          disabled={formValues.id === "" ? false : true}
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon />}
          label="Borrar"
          onClick={() => deleteProduct(params.id)}
          showInMenu
          disabled={formValues.id === "" ? false : true}
        />,
      ],
    },
  ];

  const calculateTotal = () => {
    let sum = 0;
    addedProductList.forEach((invoice) => {
      sum += invoice.subtotal;
    });

    if (formValues.discountId !== "") {
      let discount =
        discountList.find((x) => x.id === formValues.discountId).attributes
          .DiscountPercentage / 100;
      sum -= sum * discount;
    }
    return sum;
  };

  const calculateChange = () => {
    let sum = calculateTotal();
    return currencyFormat.format(formValues.paidWith - sum);
  };

  return (
    <Box m="20px">
      <Box display={"grid"} gridTemplateColumns={"3fr 1fr"} gap={"16px"}>
        <Box
          display={"flex"}
          gap={2}
          justifyContent={"space-between"}
          alignItems={"end"}
        >
          <Header
            title="Facturar"
            subtitle={
              client.id === ""
                ? "Solicitar RNC o informacion del cliente antes de la facturación."
                : `${client.identifier} - ${client.fullName}`
            }
          />

          <Box display={"flex"} gap={2} justifyContent={"end"}>
            <Box
              display="flex"
              backgroundColor={colors.primary[400]}
              p={0.2}
              borderRadius={2}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                name="searchClientParam"
                placeholder="Buscar Cliente"
                onChange={handleInputChange}
                value={formValues.searchClientParam || ""}
                inputProps={formValues.id !== "" ? { readOnly: true } : {}}
              />
              <IconButton
                type="button"
                onClick={getClientByIdentifier}
                disabled={formValues.id === "" ? false : true}
              >
                {formValues.customerId === "" ? (
                  <SearchIcon />
                ) : formValues.id === "" ? (
                  <CancelIcon />
                ) : (
                  <CheckCircleRoundedIcon />
                )}
              </IconButton>
            </Box>
            <Box
              display="flex"
              backgroundColor={colors.primary[400]}
              p={0.2}
              borderRadius={2}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Buscar RNC"
                inputProps={formValues.id !== "" ? { readOnly: true } : {}}
              />
              <IconButton
                type="button"
                disabled={formValues.id === "" ? false : true}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent={"end"} alignItems={"center"}>
          <Box
            display="flex"
            backgroundColor={colors.primary[400]}
            p={0.2}
            borderRadius={2}
            height={"39.76px"}
            width={"201.54px"}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              name="searchInvoiceParam"
              placeholder="Buscar factura"
              onChange={handleInputChange}
              value={formValues.searchInvoiceParam || ""}
            />
            <IconButton type="button" onClick={getInvoiceByInvoiceNumber}>
              {formValues.id !== "" ? <CancelIcon /> : <SearchIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box
        display={"grid"}
        gridTemplateColumns={"3fr 1fr"}
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
        }}
      >
        <DataGrid
          rows={addedProductList}
          columns={_columns}
          columnVisibilityModel={columnVisibilityModel}
        />
        <Box>
          <Box
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="10px"
          >
            <Box display={"flex"} alignItems={"center"} gap={2}>
              <Typography
                color={colors.blueAccent[500]}
                sx={{ fontSize: "20px", fontWeight: "bold" }}
              >
                Agregar Producto
              </Typography>
            </Box>
            <TextField
              id="txtProductBarCodde"
              name="productBarCode"
              fullWidth
              type="text"
              label="Código de barra"
              variant="filled"
              value={formValues.productBarCode || ""}
              onChange={handleInputChange}
              onKeyUp={(e) => addProduct(e, false)}
              sx={{ marginTop: "15px" }}
              inputProps={formValues.id !== "" ? { readOnly: true } : {}}
            />
            <TextField
              id="txtQuantity"
              name="quantity"
              fullWidth
              type="number"
              label="Cantidad"
              variant="filled"
              value={formValues.quantity || ""}
              onChange={handleInputChange}
              onKeyUp={(e) => addProduct(e, true)}
              sx={{ marginTop: "15px" }}
              inputProps={formValues.id !== "" ? { readOnly: true } : {}}
            />
          </Box>
          <Box
            marginTop={2}
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="10px"
          >
            <Typography sx={{ fontSize: "35px", fontWeight: "bold" }}>
              Total: {currencyFormat.format(calculateTotal())}
            </Typography>
            {formValues.paymentMethodId === 1 && (
              <Typography
                color={colors.greenAccent[500]}
                sx={{ fontSize: "30px", fontWeight: "bold" }}
              >
                Cambio: {calculateChange()}
              </Typography>
            )}
            <form onSubmit={handleSubmit}>
              <FormControl
                variant="filled"
                sx={{ minWidth: 120, width: "100%", marginTop: "15px" }}
              >
                <InputLabel id="lblPaymentMethod">Método de Pago</InputLabel>
                <Select
                  labelId="lblPaymentMethod"
                  id="sltPaymentMethod"
                  name="paymentMethodId"
                  value={formValues.paymentMethodId || ""}
                  onChange={handleInputChange}
                  required
                  inputProps={formValues.id !== "" ? { readOnly: true } : {}}
                >
                  {paymentMethodList.map((paymentMethod) => (
                    <MenuItem key={paymentMethod.id} value={paymentMethod.id}>
                      {paymentMethod.attributes.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formValues.paymentMethodId === 1 && (
                <TextField
                  id="txtPaidWith"
                  name="paidWith"
                  fullWidth
                  type="number"
                  label="Pagar con"
                  variant="filled"
                  value={formValues.paidWith || ""}
                  onChange={handleInputChange}
                  sx={{ marginTop: "15px" }}
                  inputProps={formValues.id !== "" ? { readOnly: true } : {}}
                />
              )}
              <FormControl
                variant="filled"
                sx={{ minWidth: 120, width: "100%", marginTop: "15px" }}
              >
                <InputLabel id="lblDiscount">Descuento</InputLabel>
                <Select
                  labelId="lblDiscount"
                  id="sltDiscount"
                  name="discountId"
                  value={formValues.discountId || ""}
                  onChange={handleInputChange}
                  inputProps={formValues.id !== "" ? { readOnly: true } : {}}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {discountList.map((discount) => (
                    <MenuItem key={discount.id} value={discount.id}>
                      {discount.attributes.DiscountPercentage}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type="submit"
                color={formValues.id === "" ? "secondary" : "error"}
                variant="contained"
                sx={{ width: "100%", marginTop: "15px" }}
                disabled={formValues.status === "Canceled" ? true : false}
              >
                {formValues.id === ""
                  ? "Pagar"
                  : formValues.status === "Paid"
                  ? "Anular"
                  : "Anulada"}
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Invoices;
