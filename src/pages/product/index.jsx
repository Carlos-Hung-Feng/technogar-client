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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

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
  });

  const [images, setImages] = useState([]);
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
          const product = response;
          setFormValues({
            id: id,
            barCode: product.barCode,
            name: product.name,
            description: product.description,
            retailPrice: product.retailPrice,
            wholesalePrice: product.wholesalePrice,
            minimumQuantity: product.minimumQuantity,
            weight: product.weight,
            length: product.length,
            width: product.width,
            height: product.height,
            supplier: product.supplier,
            category: product.category,
          });
          setImages(product.images);
          setProductOldName(product.name);
        })
        .catch((err) => console.error("No se pudo obtener el producto", err));
    }
  }, [id]);

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
    setImages([...images, ...imageFiles]); // Asegurarse de agregar las nuevas imágenes a las existentes
  };

  const handleImageDelete = (imageToDelete) => {
    setImages(images.filter((image) => image !== imageToDelete));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (id) {
      // Editar producto
      ProductAPI.update(formValues)
        .then(() => {
          alert("Producto actualizado exitosamente");
        })
        .catch((err) => alert("No se pudo actualizar el producto", err));
    } else {
      // Crear producto
      ProductAPI.create(formValues)
        .then((data) => {
          alert("Producto creado exitosamente");
          setFormValues({
            ...formValues,
            id: data.data.id,
          });

          setProductOldName(formValues.name);
        })
        .catch((err) => alert("No se pudo crear el producto", err));
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
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Buscar producto" />
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
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="10px"
          mt="20px"
        >
          <form onSubmit={handleFormSubmit}>
            <Box display="grid" gap="30px" gridTemplateColumns="1fr 1fr">
              {formValues.barCode ? (
                <Box display={"flex"} alignItems={"center"} gap={2}>
                  <Box ref={barcodeRef}>
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
              ) : (
                <Box></Box>
              )}
              <Box>
                {images.length > 0 && (
                  <Box mb={2}>
                    <Typography>Vista previa de fotos:</Typography>
                    <Box display="flex" flexWrap="wrap" gap="10px">
                      {images.map((image, index) => (
                        <Box
                          key={index}
                          position="relative"
                          width="100px"
                          height="100px"
                          sx={{
                            "&:hover .delete-icon": {
                              display: "block",
                            },
                          }}
                        >
                          <img
                            src={image}
                            alt={`product-${index}`}
                            width="100"
                            height="100"
                          />
                          <IconButton
                            onClick={() => handleImageDelete(image)}
                            className="delete-icon"
                            sx={{
                              display: "none",
                              position: "absolute",
                              top: 0,
                              right: 0,
                              backgroundColor: "transparent",
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            <DeleteOutlineOutlinedIcon
                              fontSize="small"
                              color="warning"
                            />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-photo"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="upload-photo">
                  <Button variant="contained" color="info" component="span">
                    Subir Fotos
                  </Button>
                </label>
              </Box>
              <Box display="grid" gridTemplateColumns="10fr 1fr" gap={1}>
                <TextField
                  variant="filled"
                  label="Código de Barras"
                  name="barCode"
                  value={formValues.barCode}
                  onChange={handleInputChange}
                  inputProps={formValues.id !== "" ? { readOnly: true } : {}}
                  required
                />
                <IconButton type="button" onClick={handleBarCodeGenerate}>
                  <Tooltip id="button-generate" title="Generar código de barra">
                    <CachedIcon />
                  </Tooltip>
                </IconButton>
              </Box>
              <TextField
                variant="filled"
                label="Nombre"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
              <TextField
                variant="filled"
                label="Descripción"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                required
              />
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
                label="Precio al por menor"
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
