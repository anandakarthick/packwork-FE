import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonTable from "../tables/CommonTable";
import Pagination from "../tables/Pagination";
import CommonHeader from "../header/CommonHeader";
import { ClientService } from "../../services/ClientServices";
import { Truck } from "lucide-react";
import { CommonService } from "../../services/CommonServices";
import toast from "react-hot-toast";

const Suppliers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientsData, setClientsData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  const [filters, setFilters] = useState({
     page: 1,
     limit: 20,
     search: "",
     is_active: 1, 
   });
 
   const [statusFilter, setStatusFilter] = useState("");
 
   const handleStatusFilter = (e) => {
     const value = e.target.value;
 
     setStatusFilter(value);
     setFilters((prev) => ({
       ...prev,
       page: 1,
       is_active: value === "active" ? 1 : value === "inactive" ? 0 : "", // ✅ '' means no filter
     }));
   };
   // Fetch data when filters change (including search)
   useEffect(() => {
     fetchClientData();
   }, [filters.page, filters.limit, filters.search, filters.is_active]);
 
   // Debounce search to avoid too many API calls
   useEffect(() => {
     const timer = setTimeout(() => {
       setFilters((prev) => ({
         ...prev,
         search: searchTerm,
         page: 1, // Reset to first page on new search
       }));
     }, 500); // 500ms debounce
 
     return () => clearTimeout(timer);
   }, [searchTerm]);
   const handleClearFilters = () => {
  setSearchTerm("");
  setStatusFilter("");
  setFilters((prev) => ({
    ...prev,
    search: "",
    is_active: "",
    page: 1,
  }));
};


  const fetchClientData = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
      };

      if (
        filters.is_active !== "" &&
        filters.is_active !== null &&
        filters.is_active !== undefined
      ) {
        params.is_active = filters.is_active;
      }
      const response = await ClientService.getAllClients(params);
      console.log("suppliers response:", response?.data);
      setClientsData(
        response?.data.filter((c) => c.customer_type === "vendor") || []
      );
      const p = response?.data?.pagination;
      if (p) {
        setPagination({
          current: p.page,
          pages: p.pages,
          total: p.total,
          limit: p.limit,
        });
      }
    } catch (error) {
      console.error("Error fetching Suppliers:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleImport = () => {
    console.log("Import clicked");
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    setLoading(true);
    try {
      const addressRes = await ClientService.getClientAddressById(row.id);
      if (addressRes.success && addressRes.data.length) {
        await Promise.all(
          addressRes.data.map((address) =>
            ClientService.deleteAddress(address.id)
          )
        );
      }

      const docRes = await ClientService.getCustomerAllDocuments(row.id);
      if (docRes.success && docRes.data.length) {
        await Promise.all(
          docRes.data.map((doc) =>
            ClientService.deleteCustomerDocumentsLinks(doc.id)
          )
        );
        await Promise.all(
          docRes.data.map((doc) =>
            CommonService.deleteDocuemnts(doc.document_id)
          )
        );
      }

      const deleteClientRes = await ClientService.deleteClient(row.id);
      if (!deleteClientRes.success) {
        alert(deleteClientRes.message || "Failed to delete client");
        return;
      }

      toast.success("Client deleted successfully");
      fetchClientData();
    } catch (error) {
      toast.error("Failed to delete client or related records");
      console.error("Error deleting client:", error);
      alert("Failed to delete client or related records");
    } finally {
      setLoading(false);
    }
  };
  console.log("Suppliers Data:", clientsData);
  const handleAddSupplier = () => {
    console.log("Add Supplier clicked");
    navigate("/add-supplier");
  };
  const columns = [
    // { label: "ID", key: "id" },
    { label: "Customer Id", key: "customer_reference_number" },
    { label: "Name", key: "customer_name" },
    // { label: "Contact Person", key: "contact_person_name" },
    { label: "Email", key: "email_id" },
    { label: "Phone", key: "mobile_number" },
    { label: "Status", key: "is_active" },
  ];

  return (
    <div className="p-4 corrugated-bg min-h-screen">
      <CommonHeader
        title={
          <>
            <Truck className="h-6 w-6 mr-2 text-corrugated-600" />
            Suppliers Management
          </>
        }
        subtitle="Manage your suppliers here."
        searchTerm={searchTerm}
        onSearch={handleSearch}
        searchPlaceholder="Search by suppliers..."
        onAdd={handleAddSupplier}
        addButtonText="Add New Supplier"
        onImport={handleImport}
        showImport={true}
        showFilter={true}
        statusFilter={statusFilter}
        handleStatusFilter={handleStatusFilter}
        onClearFilters={handleClearFilters}
      />

      <CommonTable
        columns={columns}
        data={clientsData}
        loading={loading}
        emptyMessage="No suppliers found"
        showActions={true}
        onView={(row) => navigate(`/view-supplier/${row.id}`)}
        onEdit={(row) => navigate(`/edit-supplier/${row.id}`)}
        onDelete={(row) => handleDelete(row)}
      />
      <Pagination
        pagination={pagination}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default Suppliers;
