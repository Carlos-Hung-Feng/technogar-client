import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useState } from "react";
import { InvoiceAPI } from "../../api/services/InvoiceAPI";
import { DataGrid } from "@mui/x-data-grid";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import CreditNoteReceipt from "../../components/CreditNoteReceipt";
import { WarehouseAPI } from "../../api/services/WarehouseAPI";
import { CreditNoteAPI } from "../../api/services/CreditNoteAPI";
import { useEffect } from "react";
import { InvoiceDiscountAPI } from "../../api/services/InvoiceDiscountAPI";
import { NcfAPI } from "../../api/services/NcfAPI";

const CreditNote = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const userId = localStorage.getItem("userId");

  const [addedProductList, setAddedProductList] = useState([]);
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: false,
  });
  const [discountList, setDiscountList] = useState([]);

  const [formValues, setFormValues] = useState({
    id: "",
    creditNoteNumber: "",
    invoiceNumber: "",
    generatedUserId: "",
    appliedToInvoiceId: "",
    status: "",
    invoiceNCF: "",
    invoiceCreatedAt: "",
    creditNoteNCF: "",
    creditNoteCreatedAt: new Date(),

    searchInvoiceParam: "",
    searchCreditNoteParam: "",
  });

  const [invoiceData, setInvoiceData] = useState(null); // Estado para almacenar los datos de la nota de credito

  const receiptRef = useRef();

  useEffect(() => {
    InvoiceDiscountAPI.getAll().then((data) => {
      setDiscountList([...data.data]);
    });
  }, []);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: "Recibo de Nota de Crédito",
  });

  let currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

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
      field: "returnReason",
      editable: true,
      headerName: "Razón",
      type: "singleSelect",
      valueOptions: ["Cambio", "Garantía"],
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
      field: "discount",
      headerName: "Descuento",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { discount } }) => {
        return <Typography>{currencyFormat.format(discount)}</Typography>;
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
      field: "creditNoteNumber",
      headerName: "Nota de Crédito",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { creditNoteNumber } }) => {
        return <Typography>{creditNoteNumber}</Typography>;
      },
      flex: 1,
    },
  ];

  const handleProcessRowUpdate = (newRow) => {
    let updatedRows = addedProductList.map((row) =>
      row.id === newRow.id ? { ...row, returnReason: newRow.value } : row
    );
    setAddedProductList(updatedRows);

    updatedRows = selectedProductList.map((row) =>
      row.id === newRow.id ? { ...row, returnReason: newRow.value } : row
    );
    setSelectedProductList(updatedRows);

    let data = {
      ...formValues,
      invoice_Products: updatedRows,
    };
    generateReceipt(data);

    // Aquí puedes hacer lo que necesites con el array actualizado,
    // como enviarlo a un servidor o actualizar otros estados.

    return newRow;
  };

  const getNextNCF = (_data) => {
    if (_data.currentValue === null) return `B0${_data.startRange}`;

    const endRangeInt = parseInt(_data.endRange);
    let nextValueInt = parseInt(_data.currentValue) + 1;
    if (endRangeInt < nextValueInt) return null;
    if (endRangeInt - 5 <= nextValueInt) {
      alert(
        `Aviso: solo queda ${
          endRangeInt - nextValueInt
        } numeros de comprobantes fiscales, por favor contacta al departamento administrativo.`
      );
    }
    return `B0${nextValueInt}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Aquí puedes manejar la lógica de envío del formulario

    if (selectedProductList.length === 0) {
      alert("La nota de crédito debe tener al menos un producto");
      return;
    }
    let data = {
      ...formValues,
      creditNoteNumber: creditNoteNumberGenerator(),
      generatedUserId: userId,
      appliedToInvoiceId: "",
      status: "Generated",
      total: calculateTotal(),
      creditNoteCreatedAt: new Date(),
      invoice_Products: selectedProductList,
    };

    let submit = true;

    if (formValues.invoiceNCF !== "" && formValues.id === "") {
      // get NCF y crear nota de creditos con NCF
      await NcfAPI.getNcfByCode("B04") // Nota de Credito
        .then((response) => {
          if (response !== undefined) {
            const NCF = getNextNCF(response);
            if (NCF === null) {
              alert(
                "NCF agotada, por favor contactar con el departamento administrativo."
              );
              submit = false;
            }
            if (submit) {
              data.creditNoteNCF = NCF;
              response.currentValue = NCF;
              NcfAPI.update(response);
            }
          } else {
            submit = false;
            alert(
              "NCF no encontrada, por favor contactar con el departamento administrativo"
            );
          }
        })
        .catch((err) => {
          submit = false;
          alert("No se pudo obtener NCF para la nota de crédito.");
          console.error("No se pudo obtener NCF para la nota de crédito.", err);
        });
    }

    await generateReceipt(data);

    if (submit) {
      if (formValues.id === "") {
        let returnReasonSelected = true;
        selectedProductList.forEach((product) => {
          if (product.returnReason === "") {
            returnReasonSelected = false;
            return;
          }
        });

        if (!returnReasonSelected) {
          alert("Debes seleccionar la razon de devolución.");
          return;
        }
        await CreditNoteAPI.create(data)
          .then((data) => {
            selectedProductList.forEach((product) => {
              CreditNoteAPI.updateInvoiceProduct(product, data.data.id);
            });
            let changeReasonProductList = selectedProductList.filter(
              (x) => x.returnReason === "Cambio"
            );

            let productsGroupedJson = Object.groupBy(
              changeReasonProductList,
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
                } else {
                  alert("Inventario no suficiente");
                }
              });
            }
            alert("Nota de Crédito generada exitosamente.");
          })
          .catch((err) => {
            alert("No se pudo generar la Nota de Crédito");
            console.error(err);
          });

        handlePrint();
        clearInputs(data.creditNoteNumber);
      } else {
        let cancelCreditNote = true;
        if (formValues.creditNoteNCF !== "") {
          const creditNoteNCF = parseInt(
            formValues.creditNoteNCF.split("B")[1]
          );
          await NcfAPI.getNfcByNCF(creditNoteNCF) // Nota de Credito
            .then((response) => {
              if (response !== undefined) {
                if (creditNoteNCF !== response.currentValue) {
                  alert("No se puede anular Nota de Crédito con NCF.");
                  cancelCreditNote = false;
                }

                if (cancelCreditNote) {
                  response.currentValue = response.currentValue - 1;
                  NcfAPI.update(response);
                }
              } else {
                alert(
                  "NCF no encontrada, por favor contactar con el departamento administrativo"
                );
              }
            })
            .catch((err) => {
              alert("No se pudo obtener NCF para la nota de crédito.");
              console.error(
                "No se pudo obtener NCF para la nota de crédito.",
                err
              );
            });
        }
        if (cancelCreditNote) {
          CreditNoteAPI.delete(data)
            .then((data) => {
              let changeReasonProductList = selectedProductList.filter(
                (x) => x.returnReason === "Cambio"
              );

              let productsGroupedJson = Object.groupBy(
                changeReasonProductList,
                ({ productId }) => productId
              );

              selectedProductList.forEach((product) => {
                CreditNoteAPI.updateInvoiceProduct(product);
              });

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
                  }
                });
              }
              alert("Nota de Crédito anulada exitosamente.");
            })
            .catch((err) => {
              alert("No se pudo anular la Nota de Crédito");
              console.error(err);
            });
          clearInputs();
        }
      }
    }
  };

  const generateReceipt = async (_data) => {
    const newInvoiceData = {
      creditNoteNumber: _data?.creditNoteNumber,
      invoiceNumber: _data?.invoiceNumber,
      appliedToInvoiceNumber: _data?.appliedToInvoiceNumber,
      total: calculateTotal(_data),
      invoiceCreatedAt: _data.invoiceCreatedAt,
      creditNoteCreatedAt: _data.creditNoteCreatedAt,
      invoiceNCF: _data.invoiceNCF,
      creditNoteNCF: _data.creditNoteNCF,
      products: _data.invoice_Products,
    };
    setInvoiceData(newInvoiceData); // Actualiza el estado con los nuevos datos
  };

  const calculateTotal = (_data = undefined) => {
    let sum = 0;
    if (_data !== undefined) {
      _data.invoice_Products.forEach((invoice) => {
        sum += invoice.subtotal;
      });
    } else {
      selectedProductList.forEach((invoice) => {
        sum += invoice.subtotal;
      });
    }

    return sum;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const creditNoteNumberGenerator = () => {
    const creditNoteNumber = Math.floor(Math.random() * 1e8)
      .toString()
      .padStart(8, "0");

    CreditNoteAPI.getCreditNoteByCreditNoteNumber(creditNoteNumber).then(
      (data) => {
        if (data !== undefined) {
          creditNoteNumberGenerator();
          return;
        }
      }
    );

    return creditNoteNumber;
  };

  const getCreditNoteByCreditNoteNumber = (e) => {
    if (formValues.searchCreditNoteParam === "") {
      return;
    }
    if (formValues.id === "") {
      CreditNoteAPI.getCreditNoteByCreditNoteNumber(
        formValues.searchCreditNoteParam
      )
        .then((response) => {
          if (response !== undefined) {
            setFormValues(response);
            setAddedProductList(response.invoice_Products);
            setSelectedProductList(response.invoice_Products);

            generateReceipt(response);
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
      clearInputs();
    }
  };

  const getInvoiceByInvoiceNumber = () => {
    if (formValues.searchInvoiceParam === "") {
      return;
    }
    InvoiceAPI.getInvoiceByInvoiceNumber(formValues.searchInvoiceParam)
      .then((response) => {
        if (response !== undefined) {
          if (response.status !== "Canceled") {
            setFormValues({
              ...formValues,
              id: "",
              status: "",
              creditNoteNumber: "",
              invoiceNumber: formValues.searchInvoiceParam,
              searchCreditNoteParam: "",
              invoiceCreatedAt: response.createdAt,
              invoiceNCF: response.NCF,
            });
            setInvoiceData(null);
            setSelectedProductList([]);
            setAddedProductList(response.invoice_Products);

            response.invoice_Products = [];
            response.invoiceCreatedAt = response.createdAt;
            response.invoiceNCF = response.NCF;
            response.creditNoteCreatedAt = formValues.creditNoteCreatedAt;

            generateReceipt(response);
          } else {
            alert("No se puede generar nota de creditos con factura anulada.");
          }
        } else {
          alert("Número de factura incorrecta, por favor intenta de nuevo.");
        }
      })
      .catch((err) => {
        alert("No se pudo obtener la factura");
        console.error("No se pudo obtener la factura", err);
      });
  };

  const clearInputs = (_searchCreditNoteParam = "") => {
    setFormValues({
      id: "",
      creditNoteNumber: "",
      invoiceNumber: "",
      generatedUserId: "",
      appliedToInvoiceId: "",
      appliedToInvoiceNumber: "",
      status: "",

      searchInvoiceParam: "",
      searchCreditNoteParam: _searchCreditNoteParam,
    });
    setInvoiceData(null);
    setAddedProductList([]);
    setSelectedProductList([]);
  };

  return (
    <Box m="20px" height={"100%"}>
      <Box display={"grid"} gridTemplateColumns={"3fr 1fr"} gap={"16px"}>
        <Box
          display={"flex"}
          gap={2}
          justifyContent={"space-between"}
          alignItems={"end"}
        >
          <Header
            title="Nota de Crédito"
            subtitle={
              formValues.appliedToInvoiceId === ""
                ? "Solo las facturas no anuladas pueden generar nota de crédito."
                : `Nota de Crédito aplicada a la factura (${formValues.appliedToInvoiceNumber}).`
            }
          />
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
              name="searchCreditNoteParam"
              placeholder="Buscar nota de crédito"
              onChange={handleInputChange}
              value={formValues.searchCreditNoteParam || ""}
            />
            <IconButton type="button" onClick={getCreditNoteByCreditNoteNumber}>
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
          isRowSelectable={(params) => params.row.creditNoteNumber === ""}
          isCellEditable={(params) => params.row.creditNoteNumber === ""}
          onCellEditCommit={handleProcessRowUpdate}
          checkboxSelection
          disableSelectionOnClick
          onSelectionModelChange={(ids) => {
            const selectedIDs = new Set(ids);
            const selectedRows = addedProductList.filter((row) =>
              selectedIDs.has(row.id)
            );
            let data = {
              ...formValues,
              invoice_Products: selectedRows,
            };
            generateReceipt(data);
            setSelectedProductList(selectedRows);
          }}
        />
        <Box>
          <Box
            backgroundColor={colors.primary[400]}
            p="15px"
            borderRadius="10px"
          >
            <Typography
              color={colors.blueAccent[500]}
              sx={{ fontSize: "20px", fontWeight: "bold" }}
            >
              Factura
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Buscar factura"
                name="searchInvoiceParam"
                value={formValues.searchInvoiceParam}
                onChange={handleInputChange}
                sx={{ marginTop: "15px" }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      type="button"
                      onClick={getInvoiceByInvoiceNumber}
                    >
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
                required
              />
              <Typography sx={{ fontSize: "35px", fontWeight: "bold" }}>
                Total: {currencyFormat.format(calculateTotal())}
              </Typography>
              <Button
                type="submit"
                color={formValues.id === "" ? "secondary" : "error"}
                variant="contained"
                sx={{ width: "100%", marginTop: "15px" }}
                disabled={formValues.status === "Applied" ? true : false}
              >
                {formValues.id === ""
                  ? "Generar"
                  : formValues.status === "Generated"
                  ? "Anular"
                  : "Aplicada"}
              </Button>
            </form>
          </Box>
          <Box
            marginTop={2}
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
                color={colors.greenAccent[500]}
                sx={{ fontSize: "20px", fontWeight: "bold" }}
              >
                Vista anticipada
              </Typography>
              {formValues.id !== "" && (
                <IconButton type="button" onClick={handlePrint}>
                  <LocalPrintshopOutlinedIcon />
                </IconButton>
              )}
            </Box>
            <Box
              sx={{
                mb: 2,
                mt: 2,
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                overflow: "hidden",
                overflowY: "scroll",
                height: "37vh",
                // justifyContent="flex-end" # DO NOT USE THIS WITH 'scroll'
              }}
            >
              <CreditNoteReceipt ref={receiptRef} invoiceData={invoiceData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CreditNote;
