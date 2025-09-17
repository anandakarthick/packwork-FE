import {
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  Truck,
  Upload,
  UserPlus,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import CommonTable from "../tables/CommonTable";
import { useNavigate } from "react-router-dom";
import CommonHeader from "../header/CommonHeader";
import { ProductService } from "../../services/ProductServices";

const Product = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAll();
      setProducts(response?.data?.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    console.log("Import clicked");
  };
  const handleAddProducts = () => {
    console.log("Add Products clicked");
    navigate("/add-product");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    { key: "product_name", label: "Product Name" },
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Sub Category" },
    { key: "client_reference_code", label: "Client Reference Code" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="p-4 corrugated-bg min-h-screen">
      <CommonHeader
        title={
          <>
            <Truck className="h-6 w-6 mr-2 text-corrugated-600" />
            Products Management
          </>
        }
        subtitle="Manage your product catalog and inventory"
        searchTerm={searchTerm}
        onSearch={handleSearch}
        searchPlaceholder="Search by products..."
        onAdd={handleAddProducts}
        addButtonText="Add New Products"
        onImport={handleImport}
        showImport={true}
      />

      <CommonTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No Products found"
        showActions={true}
        onView={(row) => console.log("View product:", row)}
        onEdit={(row) => console.log("Edit product:", row)}
        onDelete={(row) => console.log("Delete product:", row)}
      />
    </div>
  );
};
export default Product;
