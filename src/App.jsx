import { Route, Routes } from "react-router-dom";
import Product from "./components/pages/Product";
import AdminLayout from "./components/layouts/AdminLayout";
import LoginPage from "./components/pages/Auth/LoginPage";
import AddProductForm from "./components/pages/AddProduct";
import ViewProduct from "./components/pages/ViewProduct";
import SKU from "./components/pages/SKU";
import AddSku from "./components/pages/AddSku";
import ViewSku from "./components/pages/ViewSku";
import Clients from "./components/pages/Clients";
import AddClient from "./components/pages/AddClient";
import ViewClient from "./components/pages/ViewClient";
import Suppliers from "./components/pages/Suppliers";
import AddSupplier from "./components/pages/AddSupplier";
import ViewSupplier from "./components/pages/ViewSupplier";
import Process from "./components/pages/Process";
import AddProcess from "./components/pages/AddProcess";
import ViewProcess from "./components/pages/ViewProcess";
import { setAuthToken } from "./services/api";
import { Toaster } from "react-hot-toast";

function App() {
  const token = localStorage.getItem("authToken");
  if (token) {
    setAuthToken(token);
  }
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="/product" element={<Product />} />
          <Route path="/add-product" element={<AddProductForm />} />
          <Route path="/edit-product/:id" element={<AddProductForm />} />
          <Route path="/view-product/:id" element={<ViewProduct />} />
          <Route path="/sku" element={<SKU />} />
          <Route path="/add-sku" element={<AddSku />} />
          <Route path="/edit-sku/:id" element={<AddSku />} />
          <Route path="/view-sku/:id" element={<ViewSku />} />
          <Route path="/client" element={<Clients />} />
          <Route path="/add-client" element={<AddClient />} />
          <Route path="/edit-client/:id" element={<AddClient />} />
          <Route path="/view-client/:id" element={<ViewClient />} />
          <Route path="/supplier" element={<Suppliers />} />
          <Route path="/add-supplier" element={<AddSupplier />} />
          <Route path="/edit-supplier/:id" element={<AddSupplier />} />
          <Route path="/view-supplier/:id" element={<ViewSupplier />} />
          <Route path="/process" element={<Process />} />
          <Route path="/add-process" element={<AddProcess />} />
          <Route path="/edit-process/:id" element={<AddProcess />} />
          <Route path="/view-process/:id" element={<ViewProcess />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
