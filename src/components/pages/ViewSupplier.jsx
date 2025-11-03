import {
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Currency,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  File,
  FileText,
  Globe,
  Hash,
  InfoIcon,
  LocateFixedIcon,
  LocateIcon,
  LocationEdit,
  LocationEditIcon,
  Mail,
  Package,
  Phone,
  PhoneCall,
  PlusCircle,
  Receipt,
  ShoppingCart,
  Truck,
  TruckIcon,
  Undo2,
  User,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientService } from "../../services/ClientServices";
import toast from "react-hot-toast";
import { CommonService } from "../../services/CommonServices";

const ViewSupplier = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState({});
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [filteredData, setFilteredData] = useState({
    purchaseOrders: [],
    bills: [],
    grns: [],
    purchaseReturns: [],
    debitNotes: [],
  });
  const [dateFilters, setDateFilters] = useState({
    purchaseOrders: { from_date: "", to_date: "" },
    bills: { from_date: "", to_date: "" },
    grns: { from_date: "", to_date: "" },
    purchaseReturns: { from_date: "", to_date: "" },
    debitNotes: { from_date: "", to_date: "" },
  });

  const { id } = useParams();
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await ClientService.getClientById(id);
        console.log("Supplier response:", response?.data);
        setSupplier(response?.data);
        const p = await ClientService.getClientAddressById(id);
        console.log("Supplier addresses response:", p?.data);
        if (p && p.data && Array.isArray(p.data)) {
          setSupplier((prev) => ({
            ...prev,
            addresses: p.data,
          }));
        }
        const documents = await ClientService.getCustomerAllDocuments(id);
        setSupplier((prev) => ({
          ...prev,
          documents: documents?.data,
        }));
      } catch (error) {
        console.error("Error fetching Supplier:", error);
      }
    };
    const fetchConfigData = async () => {
      try {
        const response = await CommonService.getGroupedConfigs();
        console.log("Config data:", response);
        if (response.success) {
          setPaymentTerms(response.data.payment_terms);
          setBusinessTypes(response.data.business_type);
        }
      } catch (error) {
        console.error("Error fetching payment terms:", error);
      }
    };
    fetchSupplier();
    fetchConfigData();
  }, [id]);

  const getDocuments = () => {
    if (!supplier || !supplier.documents) return [];
    return Array.isArray(supplier.documents) ? supplier.documents : [];
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFilteredData = (data, section) => {
    const filters = dateFilters[section];
    const hasActiveFilter = filters?.from_date || filters?.to_date;

    // If there's an active filter, use the filtered data from state
    if (hasActiveFilter) {
      return filteredData[section] || [];
    }

    // Otherwise, return the original data
    return data || [];
  };
  const [collapsedSections, setCollapsedSections] = useState({
    purchaseOrders: true, // Collapse purchaseOrder by default
    bills: true, // Keep bills open by default
    grns: true, // Collapse Purchase Orders by default
    purchaseReturns: true, // Collapse Bills by default
    debitNotes: true,
  });
  const [expandedCards, setExpandedCards] = useState({
    bills: new Set(),
    purchaseOrders: new Set(),
    purchaseReturns: new Set(),
    grns: new Set(),
    debitNotes: new Set(),
  });
  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const toggleCardExpansion = (section, itemId) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev[section]);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return {
        ...prev,
        [section]: newSet,
      };
    });
  };
  const handleDownloadDocument = async (documentObj) => {
    try {
      if (!documentObj?.document) {
        toast.error("Document URL not found");
        return;
      }

      const fileUrl = documentObj.document;
      const fileName = `${documentObj.document_name || "document"}.${
        documentObj.document_type || "pdf"
      }`;

      // Fetch file from S3 URL
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Create temporary link for download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(link.href);
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };
  const handleViewDocument = async (documentObj) => {
    try {
      if (!documentObj?.document) {
        toast.error("Document URL not found");
        return;
      }

      window.open(documentObj.document, "_blank");
    } catch (error) {
      console.error("View error:", error);
      toast.error("Failed to view document");
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  return (
    <div>
      <div className="min-h-screen bg-corrugated-bg animate-slide-in-right">
        <div className="bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/supplier")}
                className="mr-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-1.5 mr-2">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">
                    {supplier?.customer_name}
                  </h1>
                  <p className="text-corrugated-100 text-xs">
                    ID: {supplier?.customer_reference_number || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/edit-supplier/${supplier?.id}`)}
                className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium flex items-center text-sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => navigate("/supplier")}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-corrugated-bg mt-2">
          <div className="max-w-7xl mx-auto px-4 py-2">
            {/* Customer Status & Quick Info */}
            <div className="card-corrugated p-4 mb-2">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-all duration-200 hover:from-green-100 hover:to-green-200"
                  // onClick={() => toggleSection("creditNotes")}
                  title="Click to view Debit notes details"
                >
                  <Wallet className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-700">
                    {supplier?.advance_amount || 0}
                  </div>
                  <div className="text-sm text-green-600">Advance Amount</div>
                </div>
                <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg p-4 text-center">
                  <Activity className="h-6 w-6 text-warning-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-warning-700">
                    {supplier?.outstanding_payables || 0}
                  </div>
                  <div className="text-sm text-warning-600">
                    Outstanding Payables
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information Card - Left Half */}
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-yellow-100 rounded-full p-1 mr-2">
                  <InfoIcon className="h-3 w-3 text-yellow-600" />
                </div>
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="flex items-start space-x-2">
                  <Mail className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Email Address
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm break-all">
                      {supplier?.email_id ?? "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start space-x-2">
                  <Phone className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Phone Number
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.mobile_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Phone className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Alternate Phone Number
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.alternative_mobile_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Globe className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Website
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.website == ""
                        ? "Not provided"
                        : supplier?.website ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Another Card - Right Half */}
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-green-100 rounded-full p-1 mr-2">
                  <Currency className="h-3 w-3 text-green-600" />
                </div>
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Pan No.
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.pan_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      GST No.
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.gst_number == ""
                        ? "Not provided"
                        : supplier?.gst_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Payments Terms
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {paymentTerms.find(
                        (pt) => pt.id === supplier?.payment_term_id
                      )?.display_label ?? "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Business type
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {businessTypes.find(
                        (pt) => pt.id === supplier?.business_type_id
                      )?.display_label ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-red-100 rounded-full p-1 mr-2">
                  <File className="h-3 w-3 text-red-600" />
                </div>
                Address Information
              </h3>

              {supplier?.addresses
                ?.filter((addr) => addr.type === "billing")
                .map((address, index) => (
                  <>
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 last:mb-0"
                    >
                      <div className="flex items-start space-x-2">
                        <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.contact_person_name ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.contact_email ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <PhoneCall className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.contact_person_mobile_number ??
                              "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4 last:mb-0"
                    >
                      <div className="flex items-start space-x-2">
                        <LocationEditIcon className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.address ?? "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 last:mb-0">
                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            City
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.city_name ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            State
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.state_name ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Country
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.country_name ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Pincode
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.pincode ?? "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ))}
            </div>
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-blue-100 rounded-full p-1 mr-2">
                  <PlusCircle className="h-3 w-3 text-blue-600" />
                </div>
                Addtional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Notes
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.notes == ""
                        ? "Not provided"
                        : supplier?.notes ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {getDocuments().length > 0 && (
              <div className="card-corrugated p-4 lg:col-span-2">
                <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                  <div className="bg-purple-100 rounded-full p-1 mr-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  Documents ({getDocuments().length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getDocuments().map((document, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="bg-corrugated-100 rounded-full p-2 mr-3 flex-shrink-0">
                            <FileText className="h-5 w-5 text-corrugated-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-manufacturing-800 truncate mb-1">
                              {document.document_name}
                            </h4>
                            <div className="flex items-center text-xs text-manufacturing-500 space-x-2">
                              <span>
                                {formatFileSize(document.document_size)}
                              </span>
                              <span>•</span>
                              <span>{document.document_type}</span>
                              <span>•</span>
                              <span>
                                {formatDate(document.document_created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <button
                            onClick={() => handleViewDocument(document)}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(document)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="card-corrugated p-4 lg:col-span-2">
              <h3 className="text-base font-medium text-manufacturing-800 mb-6 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-corrugated-100 rounded-full p-1 mr-2">
                  <Activity className="h-4 w-4 text-corrugated-600" />
                </div>
                Transaction History
              </h3>

              <div className="space-y-4">
                {/* Purchase Orders */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleSection("purchaseOrders")}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1 mr-2">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-manufacturing-800">
                          Purchase Orders
                        </h4>
                        <p className="text-xs text-manufacturing-600">
                          {getFilteredData(
                            supplier?.mapped_sales_order,
                            "salesOrders"
                          ).length > 0
                            ? `${
                                getFilteredData(
                                  supplier?.mapped_sales_order,
                                  "salesOrders"
                                ).length
                              } record${
                                getFilteredData(
                                  supplier?.mapped_sales_order,
                                  "salesOrders"
                                ).length !== 1
                                  ? "s"
                                  : ""
                              }`
                            : "Click to load records"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collapsedSections.purchaseOrders ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Purchase Orders Transaction Details */}
                  {!collapsedSections.purchaseOrders && (
                    <div className="p-4 bg-white">
                      {getFilteredData(
                        supplier?.mapped_sales_order,
                        "salesOrders"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-blue-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-blue-200">
                                  Order ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-blue-200">
                                  Reference
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-blue-200">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-blue-200">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-blue-200">
                                  Order Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-b border-blue-200">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {getFilteredData(
                                supplier?.mapped_sales_order,
                                "salesOrders"
                              ).map((order, index) => (
                                <tr
                                  key={order.id || index}
                                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "returnPath",
                                      `/admin/clients/view/${supplier?.id}`
                                    );
                                    navigate(`/admin/sales-orders/${order.id}`);
                                  }}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="bg-blue-100 rounded-full p-1 mr-2">
                                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <span className="text-sm font-medium text-manufacturing-800">
                                        {order.sales_order_id || "SO ID"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800">
                                    {order.sales_order_reference || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                        order.status === "completed"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : order.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          : order.status === "in_progress"
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : "bg-gray-100 text-gray-800 border-gray-200"
                                      }`}
                                    >
                                      {order.status
                                        ?.replace("_", " ")
                                        .toUpperCase() || "UNKNOWN"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800 font-medium">
                                    {order.total_amount
                                      ? formatCurrency(order.total_amount)
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600">
                                    {order.order_date
                                      ? formatDate(order.order_date).split(
                                          ","
                                        )[0]
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sessionStorage.setItem(
                                            "returnPath",
                                            `/admin/clients/view/${supplier?.id}`
                                          );
                                          navigate(
                                            `/admin/sales-orders/${order.id}`
                                          );
                                        }}
                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                        title="View Sales Order"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(
                                            order.sales_order_id
                                          );
                                          toast.success(
                                            "Sales Order ID copied to clipboard"
                                          );
                                        }}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                        title="Copy Order ID"
                                      >
                                        <Hash className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-manufacturing-500">
                          <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-3 opacity-50" />
                          <p>No Purchase Orders found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bills */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleSection("bills")}
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-1 mr-2">
                        <Receipt className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-manufacturing-800">
                          Bills
                        </h4>
                        <p className="text-xs text-manufacturing-600">
                          {getFilteredData(
                            supplier?.mapped_work_order,
                            "workOrders"
                          ).length > 0
                            ? `${
                                getFilteredData(
                                  supplier?.mapped_work_order,
                                  "workOrders"
                                ).length
                              } record${
                                getFilteredData(
                                  supplier?.mapped_work_order,
                                  "workOrders"
                                ).length !== 1
                                  ? "s"
                                  : ""
                              }`
                            : "Click to load records"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collapsedSections.bills ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Bills Transaction Details */}
                  {!collapsedSections.bills && (
                    <div className="p-4 bg-white">
                      {getFilteredData(
                        supplier?.mapped_work_order,
                        "workOrders"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Work Order ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Product
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Created Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {getFilteredData(
                                supplier?.mapped_work_order,
                                "workOrders"
                              ).map((workOrder, index) => (
                                <tr
                                  key={workOrder.id || index}
                                  className="hover:bg-green-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "returnPath",
                                      `/admin/clients/view/${supplier?.id}`
                                    );
                                    navigate(
                                      `/admin/work-orders/view/${workOrder.id}`
                                    );
                                  }}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="bg-green-100 rounded-full p-1 mr-2">
                                        <Receipt className="h-4 w-4 text-green-600" />
                                      </div>
                                      <span className="text-sm font-medium text-manufacturing-800">
                                        {workOrder.work_order_number ||
                                          "WO Number"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800">
                                    {workOrder.product_name || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                        workOrder.progress_status ===
                                        "completed"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : workOrder.progress_status ===
                                            "in_progress"
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : workOrder.progress_status ===
                                            "pending"
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          : "bg-gray-100 text-gray-800 border-gray-200"
                                      }`}
                                    >
                                      {workOrder.progress_status
                                        ?.replace("_", " ")
                                        .toUpperCase() || "UNKNOWN"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800 font-medium">
                                    {workOrder.quantity
                                      ? `${workOrder.quantity} units`
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                        workOrder.manufacture_type === "Inhouse"
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : "bg-purple-100 text-purple-800 border-purple-200"
                                      }`}
                                    >
                                      {workOrder.manufacture_type || "Unknown"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600">
                                    {workOrder.created_at
                                      ? formatDate(workOrder.created_at).split(
                                          ","
                                        )[0]
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sessionStorage.setItem(
                                            "returnPath",
                                            `/admin/clients/view/${supplier?.id}`
                                          );
                                          navigate(
                                            `/admin/work-orders/view/${workOrder.id}`
                                          );
                                        }}
                                        className="text-green-600 hover:text-green-900 transition-colors"
                                        title="View Work Order"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(
                                            workOrder.work_order_number
                                          );
                                          toast.success(
                                            "Work Order number copied to clipboard"
                                          );
                                        }}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                        title="Copy Work Order Number"
                                      >
                                        <Hash className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-manufacturing-500">
                          <Receipt className="h-8 w-8 text-green-600 mx-auto mb-3 opacity-50" />
                          <p>No Bills found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* GRN */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleSection("grns")}
                  >
                    <div className="flex items-center">
                      <div className="bg-orange-100 rounded-full p-1 mr-2">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-manufacturing-800">
                          GRN's
                        </h4>
                        <p className="text-xs text-manufacturing-600">
                          {getFilteredData(
                            supplier?.mapped_invoices,
                            "invoices"
                          ).length > 0
                            ? `${
                                getFilteredData(
                                  supplier?.mapped_invoices,
                                  "invoices"
                                ).length
                              } record${
                                getFilteredData(
                                  supplier?.mapped_invoices,
                                  "invoices"
                                ).length !== 1
                                  ? "s"
                                  : ""
                              }`
                            : "Click to load records"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collapsedSections.grns ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Invoices Transaction Details */}
                  {!collapsedSections.grns && (
                    <div className="p-4 bg-white">
                      {getFilteredData(supplier?.mapped_invoices, "invoices")
                        .length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-orange-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Invoice ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Reference
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Invoice Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Due Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider border-b border-orange-200">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {getFilteredData(
                                supplier?.mapped_invoices,
                                "invoices"
                              ).map((invoice, index) => (
                                <tr
                                  key={invoice.id || index}
                                  className="hover:bg-orange-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "returnPath",
                                      `/admin/clients/view/${supplier?.id}`
                                    );
                                    navigate(`/admin/invoices/${invoice.id}`);
                                  }}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="bg-orange-100 rounded-full p-1 mr-2">
                                        <Package className="h-4 w-4 text-orange-600" />
                                      </div>
                                      <span className="text-sm font-medium text-manufacturing-800">
                                        {invoice.invoice_number ||
                                          "Invoice Number"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800">
                                    {invoice.invoice_reference || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                        invoice.status === "paid"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : invoice.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          : invoice.status === "overdue"
                                          ? "bg-red-100 text-red-800 border-red-200"
                                          : invoice.status === "draft"
                                          ? "bg-gray-100 text-gray-800 border-gray-200"
                                          : "bg-blue-100 text-blue-800 border-blue-200"
                                      }`}
                                    >
                                      {invoice.status?.toUpperCase() ||
                                        "UNKNOWN"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800 font-medium">
                                    {invoice.total_amount
                                      ? formatCurrency(invoice.total_amount)
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600">
                                    {invoice.invoice_date
                                      ? formatDate(invoice.invoice_date).split(
                                          ","
                                        )[0]
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600">
                                    {invoice.due_date ? (
                                      <div
                                        className={`${
                                          new Date(invoice.due_date) <
                                            new Date() &&
                                          invoice.status !== "paid"
                                            ? "text-red-600 font-medium"
                                            : "text-manufacturing-600"
                                        }`}
                                      >
                                        {
                                          formatDate(invoice.due_date).split(
                                            ","
                                          )[0]
                                        }
                                        {new Date(invoice.due_date) <
                                          new Date() &&
                                          invoice.status !== "paid" && (
                                            <div className="text-xs text-red-500 font-medium">
                                              (Overdue)
                                            </div>
                                          )}
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sessionStorage.setItem(
                                            "returnPath",
                                            `/admin/clients/view/${supplier?.id}`
                                          );
                                          navigate(
                                            `/admin/invoices/${invoice.id}`
                                          );
                                        }}
                                        className="text-orange-600 hover:text-orange-900 transition-colors"
                                        title="View Invoice"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(
                                            invoice.invoice_number
                                          );
                                          toast.success(
                                            "Invoice number copied to clipboard"
                                          );
                                        }}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                        title="Copy Invoice Number"
                                      >
                                        <Hash className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-manufacturing-500">
                          <Package className="h-8 w-8 text-orange-600 mx-auto mb-3 opacity-50" />
                          <p>No grn found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Purchase Return */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleSection("purchaseReturns")}
                  >
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-full p-1 mr-2">
                        <Undo2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-manufacturing-800">
                          Purchase Return
                        </h3>
                        <p className="text-xs text-manufacturing-600">
                          {getFilteredData(supplier?.mapped_sku, "skus")
                            .length > 0
                            ? `${
                                getFilteredData(supplier?.mapped_sku, "skus")
                                  .length
                              } record${
                                getFilteredData(supplier?.mapped_sku, "skus")
                                  .length !== 1
                                  ? "s"
                                  : ""
                              }`
                            : "Click to load records"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collapsedSections.purchaseReturns ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Purchase Return Transaction Details */}
                  {!collapsedSections.purchaseReturns && (
                    <div className="p-4 bg-white">
                      {getFilteredData(supplier?.mapped_sku, "skus").length >
                      0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-purple-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider border-b border-purple-200">
                                  SKU ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider border-b border-purple-200">
                                  Product Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider border-b border-purple-200">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider border-b border-purple-200">
                                  Created Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider border-b border-purple-200">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {getFilteredData(
                                supplier?.mapped_sku,
                                "skus"
                              ).map((sku, index) => (
                                <tr
                                  key={sku.id || index}
                                  className="hover:bg-purple-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "returnPath",
                                      `/admin/clients/view/${supplier?.id}`
                                    );
                                    navigate(
                                      `/admin/sku-details/view/${sku.id}`
                                    );
                                  }}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="bg-purple-100 rounded-full p-1 mr-2">
                                        <Undo2 className="h-4 w-4 text-purple-600" />
                                      </div>
                                      <span className="text-sm font-medium text-manufacturing-800">
                                        {sku.sku_id || "SKU ID"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800">
                                    {sku.product_name || sku.sku_name || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                        sku.status === "active"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : "bg-gray-100 text-gray-800 border-gray-200"
                                      }`}
                                    >
                                      {sku.status?.toUpperCase() || "UNKNOWN"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600">
                                    {sku.created_at
                                      ? formatDate(sku.created_at).split(",")[0]
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sessionStorage.setItem(
                                            "returnPath",
                                            `/admin/clients/view/${supplier?.id}`
                                          );
                                          navigate(
                                            `/admin/sku-details/view/${sku.id}`
                                          );
                                        }}
                                        className="text-purple-600 hover:text-purple-900 transition-colors"
                                        title="View SKU Details"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(
                                            sku.sku_id
                                          );
                                          toast.success(
                                            "SKU ID copied to clipboard"
                                          );
                                        }}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                        title="Copy SKU ID"
                                      >
                                        <Hash className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-manufacturing-500">
                          <Undo2 className="h-8 w-8 text-purple-600 mx-auto mb-3 opacity-50" />
                          <p>No Purchase Return found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Debit Notes */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleSection("debitNotes")}
                  >
                    <div className="flex items-center">
                      <div className="bg-red-100 rounded-full p-1 mr-2">
                        <CreditCard className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-manufacturing-800">
                          Debit Notes
                        </h4>
                        <p className="text-xs text-manufacturing-600">
                          {supplier?.credit_notes &&
                          supplier?.credit_notes.length > 0
                            ? `${supplier?.credit_notes.length} record${
                                supplier?.credit_notes.length !== 1 ? "s" : ""
                              }`
                            : "Click to load records"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collapsedSections.debitNotes ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Debit Notes Transaction Details */}
                  {!collapsedSections.debitNotes && (
                    <div className="p-4 bg-white">
                      {supplier?.credit_notes &&
                      supplier?.credit_notes.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-red-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Credit Note ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Total Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Remaining Balance
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Credit Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Reason
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider border-b border-red-200">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {supplier?.credit_notes.map(
                                (creditNote, index) => (
                                  <tr
                                    key={creditNote.id || index}
                                    className="hover:bg-red-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                      if (creditNote.invoice_number) {
                                        sessionStorage.setItem(
                                          "returnPath",
                                          `/admin/clients/view/${supplier?.id}`
                                        );
                                        navigate(
                                          `/admin/invoices/search?number=${creditNote.invoice_number}`
                                        );
                                      }
                                    }}
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="bg-red-100 rounded-full p-1 mr-2">
                                          <CreditCard className="h-4 w-4 text-red-600" />
                                        </div>
                                        <span className="text-sm font-medium text-manufacturing-800">
                                          {creditNote.credit_note_number ||
                                            "CN Number"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                          creditNote.status === "applied"
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : creditNote.status === "draft"
                                            ? "bg-gray-100 text-gray-800 border-gray-200"
                                            : creditNote.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                            : "bg-blue-100 text-blue-800 border-blue-200"
                                        }`}
                                      >
                                        {creditNote.status?.toUpperCase() ||
                                          "UNKNOWN"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800 font-medium">
                                      {creditNote.total_amount
                                        ? formatCurrency(
                                            creditNote.total_amount
                                          )
                                        : "N/A"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-800 font-medium">
                                      {creditNote.remaining_balance
                                        ? formatCurrency(
                                            creditNote.remaining_balance
                                          )
                                        : "N/A"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600">
                                      {creditNote.credit_note_date
                                        ? formatDate(
                                            creditNote.credit_note_date
                                          ).split(",")[0]
                                        : "N/A"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-manufacturing-600 max-w-xs truncate">
                                      {creditNote.reason || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                      <div className="flex space-x-2">
                                        {creditNote.invoice_number ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              sessionStorage.setItem(
                                                "returnPath",
                                                `/admin/clients/view/${supplier?.id}`
                                              );
                                              navigate(
                                                `/admin/invoices/search?number=${creditNote.invoice_number}`
                                              );
                                            }}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="View Related Invoice"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </button>
                                        ) : (
                                          <span className="text-gray-400">
                                            -
                                          </span>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(
                                              creditNote.credit_note_number
                                            );
                                            toast.success(
                                              "Credit Note number copied to clipboard"
                                            );
                                          }}
                                          className="text-gray-600 hover:text-gray-900 transition-colors"
                                          title="Copy Credit Note Number"
                                        >
                                          <Hash className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-manufacturing-500">
                          <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-3 opacity-50" />
                          <p>No Debit notes found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSupplier;
