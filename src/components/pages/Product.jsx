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
      const response = await ProductService.getAll({ categoryFilter: "product" });
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
  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      ProductService.delete(row.id)
        .then((response) => {
          if (response.success) {
            fetchProducts();
          } else {
            alert(response.message || "Failed to delete product");
          }
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          alert("Failed to delete product");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const columns = [
    { key: "product_id", label: "ID" },
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
        onView={(row) => navigate(`/view-product/${row.id}`)}
        onEdit={(row) => navigate(`/edit-product/${row.id}`)}
        onDelete={(row) => handleDelete(row)}
      />
    </div>
  );
};
export default Product;
