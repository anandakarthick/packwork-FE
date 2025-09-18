import { Route, Routes } from "react-router-dom";
import Product from "./components/pages/Product";
import AdminLayout from "./components/layouts/AdminLayout";
import LoginPage from "./components/pages/Auth/LoginPage";
import AddProductForm from "./components/pages/AddProduct";
import ViewProduct from "./components/pages/ViewProduct";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Product />} />
        <Route path="/add-product" element={<AddProductForm />} />
        <Route path="/edit-product/:id" element={<AddProductForm />} />
        <Route path="/view-product/:id" element={<ViewProduct />} />
      </Route>
    </Routes>
  );
}

export default App;
