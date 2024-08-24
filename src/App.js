import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { MyProSidebarProvider } from "./pages/global/sidebar/sidebarContext";
import Invoices from "./pages/invoices";
import Order from "./pages/order";
import Inventory from "./pages/inventory";
import Login from "./pages/login";
import Customer from "./pages/customer";
import Product from "./pages/product";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./pages/login/authContext";
import CreditNote from "./pages/creditNote";

const App = () => {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MyProSidebarProvider>
          <AuthProvider>
            <div style={{ height: "100%", width: "100%" }}>
              <main>
                {/* <Topbar /> */}
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Invoices />} />
                    <Route path="/credit-note" element={<CreditNote />} />
                    <Route path="/customer" element={<Customer />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/product/:id" element={<Product />} />
                  </Route>
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </MyProSidebarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
