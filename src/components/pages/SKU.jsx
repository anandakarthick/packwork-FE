import React, { useEffect, useState } from "react";
import CommonHeader from "../header/CommonHeader";
import CommonTable from "../tables/CommonTable";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { ProductService } from "../../services/ProductServices";

const SKU = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [skuData, setSkuData] = useState([]);

  useEffect(() => {
    fetchSkuData();
  },[]);

  const fetchSkuData = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAll({ categoryFilter: "sku" });
      setSkuData(response?.data?.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handleAddSku = () => {
    navigate("/add-sku");
  };
  const handleImport = () => {
    console.log("Import clicked");
  };

 const handleDelete = async (row) => {
     if (window.confirm("Are you sure you want to delete this sku?")) {
       setLoading(true);
       ProductService.delete(row.id)
         .then((response) => {
           if (response.success) {
             fetchSkuData();
           } else {
             alert(response.message || "Failed to delete sku");
           }
         })
         .catch((error) => {
           console.error("Error deleting sku:", error);
           alert("Failed to delete sku");
         })
         .finally(() => {
           setLoading(false);
         });
     }
   };

  const columns = [
    { key: "product_id", label: "ID" },
    { key: "product_name", label: "SKU Name" },
    { key: "subcategory", label: "Type" },
    { key: "reference_number", label: "Reference Number" },
    { key: "status", label: "Status" },
  ];
  return (
    <div className="p-4 corrugated-bg min-h-screen">
      <CommonHeader
        title={
          <>
            <Truck className="h-6 w-6 mr-2 text-corrugated-600" />
            SKU Management
          </>
        }
        subtitle="Manage your skus"
        searchTerm={searchTerm}
        onSearch={handleSearch}
        searchPlaceholder="Search by sku..."
        onAdd={handleAddSku}
        addButtonText="Add New SKU"
        onImport={handleImport}
        showImport={true}
      />

      <CommonTable
        columns={columns}
        data={skuData}
        loading={loading}
        emptyMessage="No sku found"
        showActions={true}
        onView={(row) => navigate(`/view-sku/${row.id}`)}
        onEdit={(row) => navigate(`/edit-sku/${row.id}`)}
        onDelete={(row) => handleDelete(row)}
      />
    </div>
  );
};

export default SKU;
