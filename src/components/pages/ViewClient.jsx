import {
  Activity,
  ArrowLeft,
  CreditCard,
  Currency,
  Download,
  Edit3,
  Eye,
  File,
  FileText,
  Globe,
  InfoIcon,
  LocateFixedIcon,
  LocateIcon,
  LocationEdit,
  LocationEditIcon,
  Mail,
  Phone,
  PhoneCall,
  Truck,
  TruckIcon,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientService } from "../../services/ClientServices";
import { CommonService } from "../../services/CommonServices";
import toast from "react-hot-toast";

const ViewClient = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);

  const { id } = useParams();
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await ClientService.getClientById(id);
        console.log("Client response:", response?.data);
        setClient(response?.data);
        const p = await ClientService.getClientAddressById(id);
        console.log("Client addresses response:", p?.data);
        if (p && p.data && Array.isArray(p.data)) {
          setClient((prev) => ({
            ...prev,
            addresses: p.data,
          }));
        }
        const documents = await ClientService.getCustomerAllDocuments(id);
        setClient((prev) => ({
          ...prev,
          documents: documents?.data,
        }));
      } catch (error) {
        console.error("Error fetching client:", error);
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
    fetchClient();
    fetchConfigData();
  }, [id]);
  const getDocuments = () => {
    if (!client || !client.documents) return [];
    return Array.isArray(client.documents) ? client.documents : [];
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

      // Open directly in new tab
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
                onClick={() => navigate("/clients")}
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
                    {client?.customer_name}
                  </h1>
                  <p className="text-corrugated-100 text-xs">
                    ID: {client?.customer_reference_number || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/edit-client/${client?.id}`)}
                className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium flex items-center text-sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => navigate("/clients")}
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
                  title="Click to view credit notes details"
                >
                  <CreditCard className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-700">
                    {client?.outstanding_amount || 0}
                  </div>
                  <div className="text-sm text-green-600">
                    Outstanding Receivables
                  </div>
                </div>
                <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg p-4 text-center">
                  <Activity className="h-6 w-6 text-warning-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-warning-700">
                    {/*{formatCurrency(customer.outstanding_amount || 0)}*/}
                    {/* {formatCurrency(getTotalBalanceDue() - getCreditLimit())} */}
                    {client?.credit_limit || 0}
                  </div>
                  <div className="text-sm text-warning-600">Credit Limit</div>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 text-center">
                  <CreditCard className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-primary-700">
                    {client?.credit_balance || 0}
                  </div>
                  <div className="text-sm text-primary-600">Credit Balance</div>
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
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <InfoIcon className="h-3 w-3 text-primary-600" />
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
                      {client?.email_id ?? "Not provided"}
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
                      {client?.mobile_number ?? "Not provided"}
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
                      {client?.alternative_mobile_number ?? "Not provided"}
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
                      {client?.website == ""
                        ? "Not provided"
                        : client?.website ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Another Card - Right Half */}
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <Currency className="h-3 w-3 text-primary-600" />
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
                      {client?.pan_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      GST No.
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {client?.gst_number == ""
                        ? "Not provided"
                        : client?.gst_number ?? "Not provided"}
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
                        (pt) => pt.id === client?.payment_term_id
                      )?.display_label ?? "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Business Type
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {businessTypes.find(
                        (pt) => pt.id === client?.business_type_id
                      )?.display_label ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* 🧾 Billing Address */}
              <div className="flex-1 card-corrugated p-4 flex flex-col">
                <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                  <div className="bg-primary-100 rounded-full p-1 mr-2">
                    <File className="h-3 w-3 text-primary-600" />
                  </div>
                  Billing Address
                </h3>

                <div className="flex-1">
                  {client?.addresses
                    ?.filter((addr) => addr.type === "billing")
                    .map((address, index) => (
                      <div key={index} className="space-y-4">
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div className="flex items-start space-x-2 md:col-span-1">
                            <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.contact_person_name ?? "Not provided"}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2 md:col-span-2">
                            <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.contact_email ?? "Not provided"}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2 md:col-span-1">
                            <PhoneCall className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.contact_person_mobile_number ??
                                "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start space-x-2">
                          <LocationEditIcon className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.address ?? "Not provided"}
                          </p>
                        </div>

                        {/* City, State, Country, Pincode */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            "city_name",
                            "state_name",
                            "country_name",
                            "pincode",
                          ].map((field, i) => (
                            <div key={i}>
                              <p className="text-xs text-manufacturing-500 capitalize">
                                {field.replace("_name", "")}
                              </p>
                              <p className="font-medium text-manufacturing-800 text-sm break-all">
                                {address?.[field] ?? "Not provided"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 🚚 Shipping Address */}
            </div>
            <div className="flex-1 card-corrugated p-4 flex flex-col">
              <h3 className="text-base font-medium text-manufacturing-800 border-b border-manufacturing-200 flex items-center justify-between pb-2">
                <span className="flex items-center">
                  <div className="bg-primary-100 rounded-full p-1 mr-2">
                    <TruckIcon className="h-3 w-3 text-primary-600" />
                  </div>
                  Shipping Address
                </span>
                {client?.addresses?.filter((addr) => addr.type !== "billing")
                  .length > 1 && (
                  <div
                    className="flex items-center gap-2 overflow-x-auto "
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {client?.addresses
                      ?.filter((addr) => addr.type !== "billing")
                      .map((_, index) => (
                        <div
                          key={index}
                          onClick={() => setActiveIndex(index)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeIndex === index
                              ? "bg-corrugated-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Shipping {index + 1}
                        </div>
                      ))}
                  </div>
                )}
              </h3>

              <div className="flex-1">
                {client?.addresses
                  ?.filter((addr) => addr.type !== "billing")
                  .map((address, index) => {
                    if (index !== activeIndex) return null;
                    return (
                      <div key={index} className="space-y-4 mt-2">
                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-manufacturing-500 capitalize">
                              Location Code
                            </p>
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.location_code ?? "Not provided"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-manufacturing-500 capitalize">
                              Location Name
                            </p>
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.location_name ?? "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-start space-x-2 md:col-span-1">
                            <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.contact_person_name ?? "Not provided"}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2 md:col-span-2">
                            <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.contact_email ?? "Not provided"}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2 md:col-span-1">
                            <PhoneCall className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                            <p className="font-medium text-manufacturing-800 text-sm break-all">
                              {address?.contact_person_mobile_number ??
                                "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start space-x-2 mb-4">
                          <LocationEditIcon className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.address ?? "Not provided"}
                          </p>
                        </div>

                        {/* City, State, Country, Pincode */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            "city_name",
                            "state_name",
                            "country_name",
                            "pincode",
                          ].map((field, i) => (
                            <div key={i}>
                              <p className="text-xs text-manufacturing-500 capitalize">
                                {field.replace("_name", "")}
                              </p>
                              <p className="font-medium text-manufacturing-800 text-sm break-all">
                                {address?.[field] ?? "Not provided"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {getDocuments().length > 0 && (
              <div className="card-corrugated p-4 lg:col-span-2">
                <h3 className="text-lg font-semibold text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClient;
