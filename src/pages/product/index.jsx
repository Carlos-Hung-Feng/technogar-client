import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import Header from "../../components/Header";
import Barcode from "react-barcode";
import { SupplierAPI } from "../../api/services/SupplierAPI";
import { CategoryAPI } from "../../api/services/CategoryAPI";
import { ProductAPI } from "../../api/services/ProductAPI";
import { toPng } from "html-to-image";
import DownloadIcon from "@mui/icons-material/Download";
import CachedIcon from "@mui/icons-material/Cached";
import UploadIcon from "@mui/icons-material/Upload";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const barcodeRef = useRef(null);

  const [formValues, setFormValues] = useState({
    id: "",
    barCode: "",
    name: "",
    description: "",
    retailPrice: "",
    wholesalePrice: "",
    minimumQuantity: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    supplier: "",
    category: "",
    warranty: "",
    searchProductParam: "",
    oldImageId: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [supplierList, setSupplierList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [productOldName, setProductOldName] = useState("");

  useEffect(() => {
    SupplierAPI.getAll()
      .then((data) => setSupplierList(data.data))
      .catch((err) => console.error("No se pudo obtener los proveedores", err));

    CategoryAPI.getAll()
      .then((data) => setCategoryList(data.data))
      .catch((err) => console.error("No se pudo obtener las categorías", err));

    if (id !== undefined) {
      ProductAPI.getProductById(id)
        .then((response) => {
          setFormValues(response);
          setPreview(response.oldImageUrl);
          setProductOldName(response.name);
        })
        .catch((err) => console.error("No se pudo obtener el producto", err));
    }
  }, [id]);

  const getProductByBarCode = () => {
    ProductAPI.getProductByBarCode(formValues.searchProductParam)
      .then((response) => {
        setFormValues(response);
        setPreview(response.oldImageUrl);
        setProductOldName(response.name);
      })
      .catch((err) =>
        console.error("No se pudo obtener el orden de compra", err)
      );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleBarCodeGenerate = () => {
    if (formValues.id !== "") {
      return;
    }

    const randomCode = Math.floor(Math.random() * 1e13)
      .toString()
      .padStart(13, "0");

    ProductAPI.getProductByBarCode(randomCode).then((data) => {
      if (data.data.length > 0) {
        handleBarCodeGenerate();
        return;
      }
    });

    setFormValues({
      ...formValues,
      barCode: randomCode,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map((file) => URL.createObjectURL(file));
    if (imageFiles.length > 0) {
      setPreview(imageFiles[0]);
      setImage(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formValues.id === "") {
      // Crear producto
      ProductAPI.create(formValues)
        .then((data) => {
          if (image !== null) {
            ProductAPI.uploadFile(image, data.data.id);
          }
          alert("Producto creado exitosamente");
          setFormValues({
            ...formValues,
            id: data.data.id,
          });

          setProductOldName(formValues.name);
        })
        .catch((err) => alert("No se pudo crear el producto", err));
    } else {
      // Editar producto
      ProductAPI.update(formValues)
        .then((data) => {
          if (image !== null) {
            if (formValues.oldImageId !== "") {
              ProductAPI.deleteFile(formValues.oldImageId);
            }
            ProductAPI.uploadFile(image, data.data.id);
          }
          alert("Producto actualizado exitosamente");
        })
        .catch((err) => alert("No se pudo actualizar el producto", err));
    }
  };

  const handleDownloadBarcode = () => {
    if (barcodeRef.current) {
      toPng(barcodeRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${formValues.barCode}.png`;
          link.click();
        })
        .catch((err) => {
          alert("Error al descargar el código de barras", err);
        });
    }
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
          title="Producto"
          subtitle={
            formValues.id !== ""
              ? `Actualizando información de ${formValues.barCode} - ${productOldName}`
              : "Gestión de productos"
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
            name="searchProductParam"
            placeholder="Buscar orden"
            onChange={handleInputChange}
            value={formValues.searchProductParam || ""}
          />
          <IconButton type="button" onClick={getProductByBarCode}>
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
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                {formValues.barCode && (
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    sx={{
                      border: 3,
                      borderColor: "white",
                      borderRadius: "16px",
                    }}
                  >
                    <Box padding={"7px 0px 0px 7px"} ref={barcodeRef}>
                      <Barcode value={formValues.barCode} />
                    </Box>
                    <IconButton type="button" onClick={handleDownloadBarcode}>
                      <Tooltip
                        id="button-download"
                        title="Descargar código de barra"
                      >
                        <DownloadIcon />
                      </Tooltip>
                    </IconButton>
                  </Box>
                )}
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  sx={{
                    border: 3,
                    borderColor: "white",
                    borderRadius: "16px",
                  }}
                >
                  <Box>
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      gap="10px"
                      padding={"5px 0px 5px 5px"}
                    >
                      <img
                        src={
                          preview !== null
                            ? preview
                            : "../../assets/no_photo.jpg"
                        }
                        alt={`product-${formValues.barCode}`}
                        width="150"
                        height="150"
                      />
                    </Box>
                  </Box>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="upload-photo"
                    multiple
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="upload-photo">
                    <IconButton type="button" component="span">
                      <Tooltip id="button-upload" title="Subir foto">
                        <UploadIcon />
                      </Tooltip>
                    </IconButton>
                  </label>
                </Box>
              </Box>
              <TextField
                variant="filled"
                label="Descripción"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                multiline
                rows={7}
                required
              />
              <TextField
                variant="filled"
                label="Código de Barras"
                name="barCode"
                value={formValues.barCode}
                onChange={handleInputChange}
                InputProps={
                  formValues.id !== ""
                    ? {
                        readOnly: true,
                        endAdornment: (
                          <IconButton type="button">
                            <Tooltip
                              id="button-generate"
                              title="Generar código de barra"
                            >
                              <CachedIcon />
                            </Tooltip>
                          </IconButton>
                        ),
                      }
                    : {
                        endAdornment: (
                          <IconButton
                            type="button"
                            onClick={handleBarCodeGenerate}
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
                label="Nombre"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
              <Box
                display={"grid"}
                gridTemplateColumns={"1fr 1fr"}
                gap={"30px"}
              >
                <TextField
                  variant="filled"
                  type="number"
                  label="Cantidad Mínima"
                  name="minimumQuantity"
                  value={formValues.minimumQuantity}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  variant="filled"
                  type="number"
                  label="Garantía (meses)"
                  name="warranty"
                  value={formValues.warranty}
                  onChange={handleInputChange}
                />
              </Box>
              <Box
                display={"grid"}
                gridTemplateColumns={"1fr 1fr"}
                gap={"30px"}
              >
                <TextField
                  variant="filled"
                  type="number"
                  label="Precio al detalle"
                  name="retailPrice"
                  value={formValues.retailPrice}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  variant="filled"
                  type="number"
                  label="Precio al por mayor"
                  name="wholesalePrice"
                  value={formValues.wholesalePrice}
                  onChange={handleInputChange}
                  required
                />
              </Box>

              <FormControl
                variant="filled"
                sx={{ minWidth: 120, width: "100%" }}
                required
              >
                <InputLabel id="supplier-label">Proveedor</InputLabel>
                <Select
                  labelId="supplier-label"
                  name="supplier"
                  value={formValues.supplier}
                  onChange={handleInputChange}
                >
                  {supplierList.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.attributes.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                variant="filled"
                sx={{ minWidth: 120, width: "100%" }}
                required
              >
                <InputLabel id="category-label">Categoría</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formValues.category}
                  onChange={handleInputChange}
                >
                  {categoryList.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.attributes.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                variant="filled"
                label="Peso (lb)"
                name="weight"
                value={formValues.weight}
                onChange={handleInputChange}
              />
              <Box display="grid" gap="30px" gridTemplateColumns="1fr 1fr 1fr">
                <TextField
                  variant="filled"
                  label="Largo (cm)"
                  name="length"
                  value={formValues.length}
                  onChange={handleInputChange}
                />
                <TextField
                  variant="filled"
                  label="Ancho (cm)"
                  name="width"
                  value={formValues.width}
                  onChange={handleInputChange}
                />
                <TextField
                  variant="filled"
                  label="Alto (cm)"
                  name="height"
                  value={formValues.height}
                  onChange={handleInputChange}
                />
              </Box>
            </Box>
            <Box mt="20px" display="flex" justifyContent="flex-end" gap={2}>
              <Button
                type="button"
                color="error"
                variant="contained"
                onClick={() => navigate("/inventory")}
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
      </Box>
    </Box>
  );
};

export default Product;
