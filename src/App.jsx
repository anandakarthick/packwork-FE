import { Route, Routes } from "react-router-dom";
import Product from "./components/pages/Product";
import AdminLayout from "./components/layouts/AdminLayout";
import LoginPage from "./components/pages/Auth/LoginPage";
import AddProductForm from "./components/pages/AddProduct";
import ViewProduct from "./components/pages/ViewProduct";
import SKU from "./components/pages/SKU";
import AddSku from "./components/pages/AddSku";
import ViewSku from "./components/pages/ViewSku";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Product />} />
        <Route path="/add-product" element={<AddProductForm />} />
        <Route path="/edit-product/:id" element={<AddProductForm />} />
        <Route path="/view-product/:id" element={<ViewProduct />} />
        <Route path="/sku" element={<SKU />} />
        <Route path="/add-sku" element={<AddSku />} />
        <Route path="/edit-sku/:id" element={<AddSku />} />
        <Route path="/view-sku/:id" element={<ViewSku />} />
      </Route>
    </Routes>
  );
}

export default App;
