import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonTable from "../tables/CommonTable";
import Pagination from "../tables/Pagination";
import CommonHeader from "../header/CommonHeader";
import { ClientService } from "../../services/ClientServices";
import { Truck } from "lucide-react";
import ProcessService from "../../services/ProcessServices";
import toast from "react-hot-toast";

const Process = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [processData, setProcessData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  const [filters, setFilters] = useState({
      page: 1,
      limit: 20,
      categoryFilter: "client",
      search: "", // Added search to filters
    });
  
    // Fetch data when filters change (including search)
    useEffect(() => {
      fetchProcessData();
    }, [filters.page, filters.limit, filters.search]);
  
    // Debounce search to avoid too many API calls
    useEffect(() => {
      const timer = setTimeout(() => {
        setFilters(prev => ({
          ...prev,
          search: searchTerm,
          page: 1, // Reset to first page on new search
        }));
      }, 500); // 500ms debounce
  
      return () => clearTimeout(timer);
    }, [searchTerm]);

  const fetchProcessData = async () => {
    setLoading(true);
    try {
      const response = await ProcessService.getAllProcesses(filters);
      console.log("process response:", response?.data);

      const processWithFields = await Promise.all(
        (response?.data || []).map(async (process) => {
          const customFields = await ProcessService.getProcessCustomFields(
            process.id
          );
          console.log(
            `Custom fields for process ${process.id}:`,
            customFields?.data
          );
          return {
            ...process,
            customFields: customFields?.data || [],
          };
        })
      );

      setProcessData(processWithFields);

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
      console.error("Error fetching process:", error);
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this process?"
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const response = await ProcessService.getProcessCustomFields(row.id);
      if (response?.success && Array.isArray(response.data)) {
        const deletePromises = response.data.map((field) =>
          ProcessService.deleteProcessCustomField(field.id)
        );

        await Promise.allSettled(deletePromises);
      }

      const processDeleteRes = await ProcessService.deleteProcess(row.id);
      if (processDeleteRes?.success) {
        toast.success("Process and custom fields deleted successfully!");
        await fetchProcessData();
      } else {
        throw new Error(
          processDeleteRes?.message || "Failed to delete process"
        );
      }
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error(
        error.message || "Failed to delete process. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  console.log("process Data:", processData);
  const handleAddProcess = () => {
    console.log("Add Process clicked");
    navigate("/add-process");
  };
  const columns = [
    { label: "Process Id", key: "process_number" },
    { label: "Process Name", key: "process_name" },
    {
      label: "Custom Fields",
      key: "fields",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          {row.customFields ? `${row.customFields.length} Fields` : "0 Fields"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 corrugated-bg min-h-screen">
      <CommonHeader
        title={
          <>
            <Truck className="h-6 w-6 mr-2 text-corrugated-600" />
            Process Management
          </>
        }
        subtitle="Manage your processes"
        searchTerm={searchTerm}
        onSearch={handleSearch}
        searchPlaceholder="Search by process name..."
        onAdd={handleAddProcess}
        addButtonText="Add New Process"
        onImport={handleImport}
        showImport={true}
      />

      <CommonTable
        columns={columns}
        data={processData}
        loading={loading}
        emptyMessage="No process found"
        showActions={true}
        onView={(row) => navigate(`/view-process/${row.id}`)}
        onEdit={(row) => navigate(`/edit-process/${row.id}`)}
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

export default Process;
