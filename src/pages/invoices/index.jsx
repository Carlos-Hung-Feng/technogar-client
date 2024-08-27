import { React, useEffect, useRef, useState } from "react";
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
  Tooltip,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import { PaymentMethodAPI } from "../../api/services/PaymentMethodAPI";
import { InvoiceDiscountAPI } from "../../api/services/InvoiceDiscountAPI";
import { ProductAPI } from "../../api/services/ProductAPI";
import { WarehouseAPI } from "../../api/services/WarehouseAPI";
import { InvoiceAPI } from "../../api/services/InvoiceAPI";
import Header from "../../components/Header";
import { ClientAPI } from "../../api/services/ClientAPI";
import { useReactToPrint } from "react-to-print";
import InvoiceReceipt from "../../components/InvoiceReceipt";
import { CreditNoteAPI } from "../../api/services/CreditNoteAPI";
import CashCountReceipt from "../../components/CashCountReceipt";
import CustomModal from "../../components/CustomModal";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openModal, setOpenModal] = useState(false);

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
    creditNoteAppliedId: "",
    creditNoteAppliedNumber: "",
    creditNoteAppliedValue: 0,
    total: 0,
    createdAt: new Date(),

    productBarCode: "",

    searchInvoiceParam: "",
    searchClientParam: "",
    searchRNCParam: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [invoiceData, setInvoiceData] = useState(null); // Estado para almacenar los datos de la factura
  const invoiceReceiptRef = useRef();

  const [cashCountData, setCashCountData] = useState(null); // Estado para almacenar los datos del cuadre de caja
  const cashCountReceiptRef = useRef();

  const handlePrintCashCount = useReactToPrint({
    content: () => cashCountReceiptRef.current,
    documentTitle: "Recibo de cuadre de caja",
  });

  const handlePrintInvoice = useReactToPrint({
    content: () => invoiceReceiptRef.current,
    documentTitle: "Recibo de Compra",
  });

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

  const handleSubmitModal = () => {
    handlePrintCashCount();
    setOpenModal(false);
  };

  const getCashCount = () => {
    const today = new Date();
    let todayString = `${today.getFullYear()}-${
      today.getMonth() + 1 > 9
        ? today.getMonth() + 1
        : "0" + (today.getMonth() + 1)
    }-${today.getDate()}`;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    let tomorrowString = `${tomorrow.getFullYear()}-${
      tomorrow.getMonth() + 1 > 9
        ? tomorrow.getMonth() + 1
        : "0" + (tomorrow.getMonth() + 1)
    }-${tomorrow.getDate()}`;
    InvoiceAPI.getInvoiceTotalBetweenDate(todayString, tomorrowString).then(
      (data) => {
        const invoiceGroupedByPaymentJson = Object.groupBy(
          data,
          ({ paymentMethodId }) => paymentMethodId
        );
        let cashCountList = [];
        let total = 0;

        for (let i in invoiceGroupedByPaymentJson) {
          let paymentMethodName =
            invoiceGroupedByPaymentJson[i][0].paymentMethodName;
          let invoiceCount = invoiceGroupedByPaymentJson[i].length;
          let sum = 0;

          invoiceGroupedByPaymentJson[i].forEach((invoice) => {
            sum += invoice.total;
          });

          total += sum;

          let data = {
            paymentMethodName: paymentMethodName,
            count: invoiceCount,
            subtotal: sum,
          };

          cashCountList.push(data);
        }
        setCashCountData({
          total: total,
          invoiceCount: cashCountList,
        });
      }
    );
    setOpenModal(true);
    //handlePrintCashCount();
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Aquí puedes manejar la lógica de envío del formulario

    if (formValues.paymentMethodId === "") {
      return;
    }
    if (addedProductList.length === 0) {
      alert("La factura debe tener al menos un producto");
      return;
    }

    let total = calculateTotal();

    let data = {
      ...formValues,
      clientName: client.fullName,
      invoiceNumber: invoiceNumberGenerator(),
      returned: formValues.paidWith - total,
      status: "Paid",
      total: total,
      billedById: parseInt(localStorage.getItem("userId")),
      creditNoteAppliedId: formValues.creditNoteAppliedId,
      creditNoteAppliedNumber: formValues.creditNoteAppliedNumber,
      creditNoteAppliedValue: formValues.creditNoteAppliedValue,
      invoice_Products: addedProductList,
    };

    if (formValues.paymentMethodId !== 1) {
      data = {
        ...data,
        paidWith: total,
        returned: 0,
      };
    }

    await generateReceipt(data);

    if (formValues.id === "") {
      await InvoiceAPI.create(data)
        .then((data) => {
          if (formValues.creditNoteAppliedId !== "") {
            let creditNote = {
              id: formValues.creditNoteAppliedId,
              status: "Applied",
            };
            CreditNoteAPI.update(creditNote);
          }

          addedProductList.forEach((product) => {
            InvoiceAPI.addInvoiceProduct(data.data.id, product);
          });
          let productsGroupedJson = Object.groupBy(
            addedProductList,
            ({ productId }) => productId
          );

          for (let i in productsGroupedJson) {
            WarehouseAPI.getByWarehouseIdAndProductId(
              1, // por ahora solo tenemos un almacen, y el usuario no esta relacionado con almacen (algo como sucursal, caja, etc.).
              i
            ).then((warehouse) => {
              if (warehouse.data.length > 0) {
                let inventory = {
                  id: warehouse.data[0].id,
                  quantity:
                    parseInt(warehouse.data[0].attributes.Quantity) -
                    productsGroupedJson[i].length,
                };
                WarehouseAPI.updateInventory(inventory);
              } else {
                alert("Inventario no suficiente");
              }
            });
          }
          alert("Compra facturada exitosamente.");
        })
        .catch((err) => {
          alert("No se pudo facturar la compra");
          console.error(err);
        });

      handlePrintInvoice();
      clearInputs(data.invoiceNumber);
    } else {
      data.status = "Canceled";
      InvoiceAPI.update(data)
        .then((data) => {
          let productsGroupedJson = Object.groupBy(
            addedProductList,
            ({ productId }) => productId
          );

          for (let i in productsGroupedJson) {
            WarehouseAPI.getByWarehouseIdAndProductId(
              1, // por ahora solo tenemos un almacen, y el usuario no esta relacionado con almacen (algo como sucursal, caja, etc.).
              i
            ).then((warehouse) => {
              if (warehouse.data.length > 0) {
                let inventory = {
                  id: warehouse.data[0].id,
                  quantity:
                    parseInt(warehouse.data[0].attributes.Quantity) +
                    productsGroupedJson[i].length,
                };
                WarehouseAPI.updateInventory(inventory);
                setFormValues({
                  ...formValues,
                  status: "Canceled",
                });
              } else {
                alert("Inventario no suficiente");
              }
            });
          }
          alert("Factura anulada exitosamente.");
        })
        .catch((err) => {
          alert("No se pudo anular la factura");
          console.error(err);
        });
    }
  };

  const generateReceipt = async (_data) => {
    let sum = 0;
    if (_data.invoice_Products !== undefined) {
      _data.invoice_Products.forEach((invoice) => {
        sum += invoice.price;
      });
    } else {
      addedProductList.forEach((invoice) => {
        sum += invoice.price;
      });
    }

    let discount = discountList.find((x) => x.id === _data.discountId)
      .attributes.DiscountPercentage;

    const newInvoiceData = {
      invoiceNumber: _data.invoiceNumber,
      clientName: _data.clientName,
      clientRNC: _data.RNC,
      subtotal: sum,
      discountPersentage: discount,
      discount: sum * (discount / 100),
      total: _data.total,
      createdAt: _data.createdAt,
      paymentMethod: paymentMethodList.find(
        (x) => x.id === _data.paymentMethodId
      ).attributes.Name,
      paidWith: _data.paidWith,
      change: _data.returned,
      creditNoteAppliedNumber: _data.creditNoteAppliedNumber,
      creditNoteAppliedValue: _data.creditNoteAppliedValue,
      products:
        _data.invoice_Products !== undefined
          ? _data.invoice_Products
          : addedProductList,
    };
    setInvoiceData(newInvoiceData); // Actualiza el estado con los nuevos datos
  };

  const getInvoiceByInvoiceNumber = () => {
    if (formValues.searchInvoiceParam === "") {
      return;
    }
    if (formValues.id === "") {
      InvoiceAPI.getInvoiceByInvoiceNumber(formValues.searchInvoiceParam)
        .then((invoiceResponse) => {
          if (invoiceResponse !== undefined) {
            let check = invoiceResponse.invoice_Products.filter(
              (x) => x.creditNoteNumber !== ""
            );

            if (check.length > 0) {
              invoiceResponse.status = "CreditNoteGenerated";
            }
            setFormValues(invoiceResponse);
            setAddedProductList(invoiceResponse.invoice_Products);

            if (invoiceResponse.searchClientParam !== "") {
              ClientAPI.getClientByIdentifier(invoiceResponse.searchClientParam)
                .then((response) => {
                  if (response !== undefined) {
                    setClient(response);
                    let data = {
                      ...invoiceResponse,
                      clientName: response.fullName,
                    };
                    generateReceipt(data);
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
            } else {
              generateReceipt(invoiceResponse);
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
      clearInputs();
    }
  };

  const getCreditNoteByCreditNoteNumber = (e) => {
    if (formValues.creditNoteAppliedNumber === "") {
      return;
    }
    if (formValues.creditNoteAppliedId === "") {
      CreditNoteAPI.getCreditNoteByCreditNoteNumber(
        formValues.creditNoteAppliedNumber
      )
        .then((response) => {
          if (response !== undefined) {
            if (response.status === "Applied") {
              alert("Nota de Crédito ya aplicada en otra factura.");
            } else {
              setFormValues({
                ...formValues,
                creditNoteAppliedId: response.id,
                creditNoteAppliedValue: response.total,
              });
            }
          } else {
            alert(
              "Número de nota de crédito incorrecta, por favor intenta de nuevo."
            );
          }
        })
        .catch((err) => {
          alert("No se pudo obtener la nota de crédito");
          console.error("No se pudo obtener la nota de crédito", err);
        });
    } else {
      setFormValues({
        ...formValues,
        creditNoteAppliedId: "",
        creditNoteAppliedNumber: "",
        creditNoteAppliedValue: 0,
      });
    }
  };

  const clearInputs = async (_searchInvoiceParam = "") => {
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
      creditNoteAppliedId: "",
      creditNoteAppliedNumber: "",
      creditNoteAppliedValue: 0,

      productBarCode: "",

      searchInvoiceParam: _searchInvoiceParam,
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
  };

  const getClientByIdentifier = () => {
    if (formValues.searchClientParam === "") {
      return;
    }

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
    }

    clearInputs();
  };

  const addProduct = (e) => {
    if (e.key !== "Enter" || e.keyCode !== 13) {
      return;
    }

    if (formValues.productBarCode === "") {
      return;
    }

    let quantity = addedProductList.filter(
      (x) => x.barCode === formValues.productBarCode
    ).length;

    ProductAPI.getProductByBarCode(formValues.productBarCode)
      .then((data) => {
        console.log(data);
        let price = data.retailPrice;

        if (client.id !== "") {
          price =
            client.customerType === "Wholesale"
              ? data.wholesalePrice
              : data.retailPrice;
        }
        let product = {
          id: Date.now(),
          productId: data.id,
          barCode: data.barCode,
          name: data.name,
          description: data.description,
          price: price,
        };

        // check inventory
        WarehouseAPI.getByWarehouseIdAndProductId(1, product.productId).then(
          (data) => {
            if (data.data[0].attributes.Quantity <= quantity + 1) {
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

    calculateTotal();
    clearFields();
  };

  const deleteProduct = (_id) => {
    // lógica para borrar producto
    setAddedProductList(
      addedProductList.filter((product) => product.id !== _id)
    );
  };

  const clearFields = () => {
    setFormValues({
      ...formValues,
      productBarCode: "",
    });
  };

  const _columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "barCode", headerName: "Código", flex: 1 },
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
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon />}
          label="Borrar"
          onClick={() => deleteProduct(params.id)}
          disabled={formValues.id === "" ? false : true}
        />,
      ],
    },
  ];

  const calculateTotal = (_data = undefined) => {
    let sum = 0;

    if (_data !== undefined) {
      _data.invoice_Products.forEach((invoice) => {
        sum += invoice.price;
      });
      if (_data.discountId !== "") {
        let discount =
          discountList.find((x) => x.id === _data.discountId).attributes
            .DiscountPercentage / 100;
        sum -= sum * discount;
      }
    } else {
      addedProductList.forEach((invoice) => {
        sum += invoice.price;
      });
      if (formValues.discountId !== "") {
        let discount =
          discountList.find((x) => x.id === formValues.discountId).attributes
            .DiscountPercentage / 100;
        sum -= sum * discount;
      }
    }

    return sum - formValues.creditNoteAppliedValue;
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
          disableSelectionOnClick
          getRowClassName={(params) => {
            return params.row.creditNoteNumber !== "" && formValues.id !== ""
              ? "danger"
              : "";
          }}
          sx={{
            ".danger": {
              bgcolor: `${colors.redAccent[700]}`,
              "&:hover": {
                bgcolor: `${colors.redAccent[800]}`,
              },
            },
          }}
        />
        <Box>
          <Box
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="10px"
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography
                color={colors.blueAccent[500]}
                sx={{ fontSize: "20px", fontWeight: "bold" }}
              >
                Agregar Producto
              </Typography>
              {formValues.id !== "" ? (
                <IconButton
                  type="button"
                  onClick={handlePrintInvoice}
                  disabled={formValues.status === "Canceled" ? true : false}
                >
                  <LocalPrintshopOutlinedIcon />
                </IconButton>
              ) : (
                <CustomModal
                  buttonIcon={<PointOfSaleOutlinedIcon />}
                  onClick={getCashCount}
                  open={openModal}
                  setOpen={setOpenModal}
                  message={{
                    header: "Cierre de caja",
                    body: "Estas seguro que deseas cerrar la caja?",
                  }}
                  onSubmit={handleSubmitModal}
                />
              )}
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
              onKeyUp={(e) => addProduct(e)}
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
              <Box display={"flex"} alignItems={"center"} gap={"10px"}>
                <TextField
                  id="txtCreditNoteAppliedNumber"
                  name="creditNoteAppliedNumber"
                  type="text"
                  label="NC #"
                  variant="filled"
                  value={formValues.creditNoteAppliedNumber || ""}
                  onChange={handleInputChange}
                  sx={{ marginTop: "15px" }}
                  InputProps={
                    formValues.id !== ""
                      ? {
                          readOnly: true,
                          endAdornment: (
                            <IconButton
                              type="button"
                              onClick={getCreditNoteByCreditNoteNumber}
                              disabled
                            >
                              <Tooltip
                                id="button-searchCreditNote"
                                title="Buscar Nota de Crédito"
                              >
                                {formValues.creditNoteAppliedId !== "" ? (
                                  <CheckCircleRoundedIcon />
                                ) : (
                                  <SearchIcon />
                                )}
                              </Tooltip>
                            </IconButton>
                          ),
                        }
                      : {
                          endAdornment: (
                            <IconButton
                              type="button"
                              onClick={getCreditNoteByCreditNoteNumber}
                            >
                              <Tooltip
                                id="button-searchCreditNote"
                                title="Buscar Nota de Crédito"
                              >
                                {formValues.creditNoteAppliedId !== "" ? (
                                  <CancelIcon />
                                ) : (
                                  <SearchIcon />
                                )}
                              </Tooltip>
                            </IconButton>
                          ),
                        }
                  }
                />
                <Typography
                  sx={{
                    mt: "15px",
                    fontWeight: "bold",
                    fontSize: "25px",
                    textAlign: "right",
                  }}
                >
                  {currencyFormat.format(formValues.creditNoteAppliedValue)}
                </Typography>
              </Box>
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
              <Button
                type="submit"
                color={formValues.id === "" ? "secondary" : "error"}
                variant="contained"
                sx={{ width: "100%", marginTop: "15px" }}
                disabled={
                  formValues.status === "Paid" || formValues.status === ""
                    ? false
                    : true
                }
              >
                {formValues.id === ""
                  ? "Pagar"
                  : formValues.status === "Paid"
                  ? "Anular"
                  : formValues.status === "Canceled"
                  ? "Anulada"
                  : "Nota de Crédito Generada"}
              </Button>
            </form>
          </Box>
          <Box display={"none"}>
            <InvoiceReceipt ref={invoiceReceiptRef} invoiceData={invoiceData} />
            <CashCountReceipt
              ref={cashCountReceiptRef}
              cashCountData={cashCountData}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Invoices;
