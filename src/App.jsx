import { Route, Routes } from "react-router-dom";
import Product from "./components/pages/Product";
import AdminLayout from "./components/layouts/AdminLayout";
import LoginPage from "./components/pages/Auth/LoginPage";
import AddProductForm from "./components/pages/AddProduct";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Product />} />
        <Route path="/add-product" element={<AddProductForm />} />
      </Route>
    </Routes>
  );
}

export default App;
