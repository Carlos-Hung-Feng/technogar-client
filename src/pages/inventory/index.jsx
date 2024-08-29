import { React, useState, useEffect } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { ProductAPI } from "../../api/services/ProductAPI";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

const Inventory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [productList, setProductList] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    ProductAPI.getInventory()
      .then((data) => {
        // Manejar la respuesta de éxito
        setProductList([...data]);
      })
      .catch((err) => {
        // Manejar el error
        console.error("No se pudo obtener los productos", err);
        setError("No se pudo obtener los productos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const navigateToProductDetail = (_id = undefined) => {
    navigate(_id === undefined ? `/product` : `/product/${_id}`);
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
      field: "BarCode",
      headerName: "Código",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "Name",
      headerName: "Nombre",
      cellClassName: "name-column--cell",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "Quantity",
      headerName: "Cantidad",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "Category",
      headerName: "Categoría",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "Description",
      headerName: "Descripcion",
      width: 400,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "MinimumQuantity",
      headerName: "Cantidad Minima",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "RetailPrice",
      headerName: "Al detalle",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { RetailPrice } }) => {
        return (
          <Typography color={colors.greenAccent[500]}>
            ${RetailPrice}
          </Typography>
        );
      },
      flex: 1,
    },
    {
      field: "WholesalePrice",
      headerName: "Al por mayor",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row: { WholesalePrice } }) => {
        return (
          <Typography color={colors.blueAccent[500]}>
            ${WholesalePrice}
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
          icon={<RemoveRedEyeOutlinedIcon />}
          title="Ver detalles"
          label="detail"
          onClick={() => navigateToProductDetail(params.id)}
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
            Inventario
          </Typography>

          <Box display="flex" alignItems="center">
            <Typography color={colors.greenAccent[500]} fontSize={15}>
              Hacer clic en la fila para ver detalles del producto.
            </Typography>
          </Box>
        </Box>
        <Box p={0.2} borderRadius={2}>
          <Button
            type="button"
            color="secondary"
            variant="contained"
            onClick={() => navigateToProductDetail(undefined)}
          >
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
        <DataGrid
          rows={productList}
          columns={_columns}
          columnVisibilityModel={columnVisibilityModel}
        />
      </Box>
    </Box>
  );
};

export default Inventory;
