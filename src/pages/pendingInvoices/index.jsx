import { React, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { InvoiceAPI } from "../../api/services/InvoiceAPI";
import { PaymentMethodAPI } from "../../api/services/PaymentMethodAPI";
import CustomModal from "../../components/CustomModal";
import { WarehouseAPI } from "../../api/services/WarehouseAPI";
import { ExpenseAPI } from "../../api/services/ExpenseAPI";

const PendingInvoice = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [openInvoiceInfoModal, setOpenInvoiceInfoModal] = useState(false);

  const [paymentMethodList, setPaymentMethodList] = useState([]);

  const [pendingInvoiceList, setPendingInvoiceList] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: false,
  });

  const [formValues, setFormValues] = useState({
    id: "",
    invoiceNumber: "",
    NCF: "",
    RNC: "",
    note: "",
    paidWith: "",
    returned: 0,
    delivery: "",
    total: "",
    paymentMethodId: "",
    paymentMethodName: "",
    createdAt: new Date(),

    expenseAmount: 0,
    expenseDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    InvoiceAPI.getPendingInvoices()
      .then((data) => {
        // Manejar la respuesta de éxito
        setPendingInvoiceList([...data]);
      })
      .catch((err) => {
        // Manejar el error
        console.error("No se pudo obtener los productos", err);
        setError("No se pudo obtener los productos");
      })
      .finally(() => {
        setLoading(false);
      });

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
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormValues({ ...formValues, [name]: newValue });
  };

  const handleSubmitInvoiceInfoModal = (invoiceCompleted) => {
    // Aqui llama al metodo modificar la factura de pendiente a cancelada o pagada
    // En caso de ser pagada validar si tuvo que pagar envio, y una descripcion del gasto.
    let data = {
      id: formValues.id,
      status: "Paid",
    };

    let expense = {
      amount: formValues.expenseAmount,
      description: formValues.expenseDescription,
      type: formValues.delivery ? "Shipment" : "Others",
    };

    if (invoiceCompleted) {
      data.status = "Paid";
      InvoiceAPI.update(data)
        .then((data) => {
          ExpenseAPI.create(expense)
            .then()
            .catch((err) => {
              alert("No se pudo registrar el gasto del envío.");
              console.error(err);
            });
          alert("Factura completada exitosamente.");
        })
        .catch((err) => {
          alert("No se pudo completar la factura");
          console.error(err);
        });
    }
    //TODO: Permitir anular factura desde el modulo de pending
    // else {
    // data.status = "Canceled";
    //   InvoiceAPI.update(data)
    //     .then((data) => {
    //       let productsGroupedJson = Object.groupBy(
    //         addedProductList,
    //         ({ productId }) => productId
    //       );

    //       for (let i in productsGroupedJson) {
    //         WarehouseAPI.getByWarehouseIdAndProductId(
    //           1, // por ahora solo tenemos un almacen, y el usuario no esta relacionado con almacen (algo como sucursal, caja, etc.).
    //           i
    //         ).then((warehouse) => {
    //           if (warehouse.data.length > 0) {
    //             let inventory = {
    //               id: warehouse.data[0].id,
    //               quantity:
    //                 parseInt(warehouse.data[0].attributes.Quantity) +
    //                 productsGroupedJson[i].length,
    //             };
    //             WarehouseAPI.updateInventory(inventory);
    //             setFormValues({
    //               ...formValues,
    //               status: "Canceled",
    //             });
    //           } else {
    //             alert("Inventario no suficiente");
    //           }
    //         });
    //       }
    //       alert("Factura anulada exitosamente.");
    //     })
    //     .catch((err) => {
    //       alert("No se pudo anular la factura");
    //       console.error(err);
    //     });
    // }

    setPendingInvoiceList(
      pendingInvoiceList.filter((invoice) => invoice.id !== formValues.id)
    );
    setOpenInvoiceInfoModal(false);
  };

  const getInvoiceInfo = (_id) => {
    InvoiceAPI.getInvoiceById(_id).then((data) => {
      setFormValues(data);
    });
    setOpenInvoiceInfoModal(true);
  };

  const _columns = [
    {
      field: "id",
      headerName: "ID",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "invoiceNumber",
      headerName: "Número de factura",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "total",
      headerName: "Total",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { total } }) => {
        return (
          <Typography color={colors.greenAccent[500]}>${total}</Typography>
        );
      },
      flex: 1,
    },
    {
      field: "paidWith",
      headerName: "Pagar Con",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { paidWith } }) => {
        return (
          <Typography color={colors.blueAccent[500]}>${paidWith}</Typography>
        );
      },
      flex: 1,
    },
    {
      field: "returned",
      headerName: "Cambio",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { returned } }) => {
        return <Typography>${returned}</Typography>;
      },
      flex: 1,
    },
    {
      field: "paymentMethodId",
      headerName: "Metodo de pago",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { paymentMethodId } }) => {
        return (
          <Typography>
            {
              paymentMethodList.find((x) => x.id === paymentMethodId).attributes
                .Name
            }
          </Typography>
        );
      },
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Fecha de facturación",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { createdAt } }) => {
        return <Typography>{new Date(createdAt).toLocaleString()}</Typography>;
      },
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<RemoveRedEyeOutlinedIcon />}
          title="Ver detalles"
          label="detail"
          onClick={() => {
            getInvoiceInfo(params.id);
          }}
        />,
      ],
      flex: 1,
    },
  ];
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontSize={32} fontWeight={"bold"}>
            Facturas en proceso
          </Typography>

          <Box display="flex" alignItems="center">
            <Typography color={colors.greenAccent[500]} fontSize={15}>
              Se requiere completar el pedido para reflejarse en la cierre de
              caja.
            </Typography>
          </Box>
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
          pagination
          rows={pendingInvoiceList}
          columns={_columns}
          columnVisibilityModel={columnVisibilityModel}
        />
      </Box>
      <>
        <CustomModal
          open={openInvoiceInfoModal}
          setOpen={setOpenInvoiceInfoModal}
          message={{
            header: "Detalles de la Factura",
            body: (
              <Box>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "16px",
                    maxWidth: "400px",
                    margin: "auto",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        component={"span"}
                        variant="body1"
                        color="text.secondary"
                      >
                        <strong>Número de factura:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography component={"span"} variant="body1">
                        {formValues.invoiceNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        component={"span"}
                        variant="body1"
                        color="text.secondary"
                      >
                        <strong>Fecha:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography component={"span"} variant="body1">
                        {new Date(formValues.createdAt).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        component={"span"}
                        variant="body1"
                        color="text.secondary"
                      >
                        <strong>Método de Pago:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography component={"span"} variant="body1">
                        {formValues.paymentMethodId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        component={"span"}
                        variant="body1"
                        color="text.secondary"
                      >
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography component={"span"} variant="body1">
                        {formValues.total.toLocaleString("en", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        RD$
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <TextField
                  id="txtExpenseAmount"
                  name="expenseAmount"
                  fullWidth
                  type="number"
                  label="Envío"
                  variant="filled"
                  value={formValues.expenseAmount || ""}
                  onChange={handleInputChange}
                  sx={{ marginTop: "15px" }}
                />
                <TextField
                  id="txtExpenseDescription"
                  name="expenseDescription"
                  fullWidth
                  type="text"
                  label="Descripción"
                  variant="filled"
                  value={formValues.expenseDescription || ""}
                  onChange={handleInputChange}
                  sx={{ marginTop: "15px" }}
                />
              </Box>
            ),
          }}
          onClickButton_1={() => handleSubmitInvoiceInfoModal(true)}
          buttonText_1="Completar"
          // onClickButton_2={() => handleSubmitInvoiceInfoModal(false)}
          // buttonText_2="Anular"
        />
      </>
    </Box>
  );
};

export default PendingInvoice;
