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
  Tooltip,
} from "@mui/material";
import { tokens } from "../../theme";
import SearchIcon from "@mui/icons-material/Search";
import CachedIcon from "@mui/icons-material/Cached";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import Header from "../../components/Header";
import { PaymentMethodAPI } from "../../api/services/PaymentMethodAPI";
import { CategoryAPI } from "../../api/services/CategoryAPI";
import { ClientAPI } from "../../api/services/ClientAPI";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import CustomerCodeReceipt from "../../components/CustomerCodeReceipt";

const Customer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [clientOldName, setClientOldName] = useState("");
  const [formValues, setFormValues] = useState({
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
    customerCode: "",
    searchClientParam: "",
  });

  const [customerCodeData, setCustomerCodeData] = useState(null); // Estado para almacenar los datos del cliente
  const customerCodeReceiptRef = useRef();

  useEffect(() => {
    PaymentMethodAPI.getAll()
      .then((data) => {
        setPaymentMethodList([...data.data]);
      })
      .catch((err) => {
        console.error("No se pudo obtener los metodos de pagos", err);
      });

    CategoryAPI.getAll()
      .then((data) => {
        setCategoryList([...data.data]);
      })
      .catch((err) => {
        console.error("No se pudo obtener las categorías", err);
      });
  }, []);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handlePrintCustomerCode = useReactToPrint({
    content: () => customerCodeReceiptRef.current,
    documentTitle: "Código del cliente",
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let data = { ...formValues };

    if (formValues.id === "") {
      ClientAPI.create(data)
        .then((data) => {
          alert("Cliente creado exitosamente");
          setFormValues({
            ...formValues,
            id: data.data.id,
          });
          setClientOldName(formValues.fullName);
          setCustomerCodeData({
            code: formValues.customerCode,
          });
        })
        .catch((err) => alert("No se pudo crear el cliente", err));
      handlePrintCustomerCode();
    } else {
      ClientAPI.update(data)
        .then((data) => alert("Cliente actualizado exitosamente"))
        .catch((err) => alert("No se pudo actualizar el cliente", err));
    }
  };

  const handleCheckIdentifier = () => {
    if (formValues.id !== "") return;

    ClientAPI.getClientByIdentifier(formValues.identifier).then((response) => {
      if (response !== undefined) {
        alert("Cédula / RNC ya utilizada, por favor intenta con otro número.");
        setFormValues({
          ...formValues,
          identifier: "",
        });
      }
    });
  };

  const handleCustomerCodeGenerate = () => {
    if (formValues.id !== "") {
      return;
    }

    const randomCode = Math.floor(Math.random() * 1e10)
      .toString()
      .padStart(10, "0");

    ClientAPI.getClientByCustomerCode(randomCode).then((data) => {
      if (data.data.length > 0) {
        handleCustomerCodeGenerate();
        return;
      }
    });

    setFormValues({
      ...formValues,
      customerCode: randomCode,
    });
  };

  const getClientByIdentifier = () => {
    ClientAPI.getClientByIdentifier(formValues.searchClientParam)
      .then((response) => {
        console.log("test", response);
        if (response !== undefined) {
          setFormValues(response);
          setClientOldName(response.fullName);

          setCustomerCodeData({
            code: response.customerCode,
          });
        } else {
          alert("RNC / Cédula incorrecta, por favor intenta de nuevo.");
        }
      })
      .catch((err) => {
        alert("No se pudo obtener el cliente");
        console.error("No se pudo obtener el cliente", err);
      });
  };

  const clearInputs = () => {
    setFormValues({
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
      customerCode: "",
      searchClientParam: "",
    });
  };
  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={"-15px"}
      >
        <Header
          title="Cliente"
          subtitle={
            formValues.id !== ""
              ? `Actualizando información de ${formValues.id} - ${clientOldName}`
              : "Creando cliente nuevo"
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
            placeholder="Buscar con RNC / Cédula"
            onChange={handleInputChange}
            name="searchClientParam"
            value={formValues.searchClientParam || ""}
          />
          <IconButton type="button" onClick={getClientByIdentifier}>
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
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="10px"
          mt="20px"
        >
          <form onSubmit={handleFormSubmit}>
            <Box display="grid" gap="30px" gridTemplateColumns="1fr 1fr">
              <Box display={"flex"} gap={5} alignItems={"center"}>
                {formValues.fullName && (
                  <Typography sx={{ fontWeight: "bold", fontSize: "35px" }}>
                    {formValues.fullName}
                  </Typography>
                )}
              </Box>
              <TextField
                variant="filled"
                type="text"
                label="Dirección"
                onChange={handleInputChange}
                name="address"
                value={formValues.address || ""}
                multiline
                rows={4}
                required
              />
              <TextField
                variant="filled"
                type="text"
                label="Nombre Completo"
                onChange={handleInputChange}
                name="fullName"
                value={formValues.fullName || ""}
                required
              />
              <TextField
                variant="filled"
                label="Código del cliente"
                name="customerCode"
                value={formValues.customerCode || ""}
                onChange={handleInputChange}
                InputProps={
                  formValues.id !== ""
                    ? {
                        readOnly: true,
                        endAdornment: (
                          <IconButton
                            type="button"
                            onClick={handlePrintCustomerCode}
                          >
                            <Tooltip
                              id="button-generate"
                              title="Generar código de barra"
                            >
                              <LocalPrintshopOutlinedIcon />
                            </Tooltip>
                          </IconButton>
                        ),
                      }
                    : {
                        endAdornment: (
                          <IconButton
                            type="button"
                            onClick={handleCustomerCodeGenerate}
                          >
                            <Tooltip
                              id="button-generate"
                              title="Generar código de barra"
                            >
                              <CachedIcon />
                            </Tooltip>
                          </IconButton>
                        ),
                      }
                }
                required
              />
              <TextField
                variant="filled"
                type="text"
                label='RNC / Cédula (sin guión "-")'
                onChange={handleInputChange}
                onBlur={handleCheckIdentifier}
                name="identifier"
                value={formValues.identifier || ""}
                required
              />
              <Box display={"flex"} gap={3.5}>
                <FormControl variant="filled" fullWidth>
                  <InputLabel id="lblPaymentMethod">Método de Pago</InputLabel>
                  <Select
                    labelId="lblPaymentMethod"
                    id="sltPaymentMethod"
                    name="paymentMethod"
                    value={formValues.paymentMethod || ""}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Ninguno</em>
                    </MenuItem>
                    {paymentMethodList.map((method) => (
                      <MenuItem key={method.id} value={method.id}>
                        {method.attributes.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="filled" fullWidth>
                  <InputLabel id="lblCustomerType">Tipo de Cliente*</InputLabel>
                  <Select
                    labelId="lblCustomerType"
                    id="sltCustomerType"
                    name="customerType"
                    value={formValues.customerType || ""}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="Wholesale">Mayorista</MenuItem>
                    <MenuItem value="Retail">Minorista</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                variant="filled"
                type="text"
                label="Teléfono"
                onChange={handleInputChange}
                name="telephone"
                value={formValues.telephone || ""}
                placeholder="(xxx) xxx-xxxx"
                required
              />
              <TextField
                variant="filled"
                type="email"
                label="Email"
                onChange={handleInputChange}
                name="email"
                value={formValues.email || ""}
              />
              <TextField
                variant="filled"
                type="date"
                label="Fecha de Última Compra"
                onChange={handleInputChange}
                name="lastPurchaseDate"
                value={formValues.lastPurchaseDate || ""}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl variant="filled">
                <InputLabel id="lblProductPreferences">
                  Preferencias de Producto
                </InputLabel>
                <Select
                  labelId="lblProductPreferences"
                  id="sltProductPreferences"
                  name="productPreferences"
                  value={formValues.productPreferences || ""}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {categoryList.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.attributes.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                variant="filled"
                type="text"
                label="Nota"
                onChange={handleInputChange}
                name="note"
                value={formValues.note || ""}
                multiline
                rows={4}
              />
              <TextField
                variant="filled"
                type="text"
                label="Enlaces"
                onChange={handleInputChange}
                name="links"
                value={formValues.links || ""}
                multiline
                rows={4}
              />
            </Box>
            <Box mt="20px" display="flex" justifyContent="flex-end" gap={2}>
              <Button
                type="button"
                color="error"
                variant="contained"
                onClick={clearInputs}
              >
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
        <Box display={"none"}>
          <CustomerCodeReceipt
            ref={customerCodeReceiptRef}
            customerCodeData={customerCodeData}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Customer;
