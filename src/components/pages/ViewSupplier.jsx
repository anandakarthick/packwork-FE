import {
  Activity,
  ArrowLeft,
  CreditCard,
  Currency,
  Edit3,
  File,
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
import toast from "react-hot-toast";

const ViewSupplier = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState({});

  const { id } = useParams();
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await ClientService.getClientById(id);
        console.log("Supplier response:", response?.data);
        setSupplier(response?.data);
        const p = await ClientService.getClientAddressById(id);
        if (p && p.data && Array.isArray(p.data)) {
          setSupplier((prev) => ({
            ...prev,
            addresses: p.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    };
    fetchSupplier();
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

  const handleDownloadDocument = async (documentObj) => {
    console.log(`📄 Downloading document:`, documentObj);
    // try {
    //   console.log("📄 Downloading document:", documentObj);

    //   // Use API call for download to ensure proper authentication
    //   const response = await customerService.downloadCustomerDocument(
    //     id,
    //     documentObj.fileName
    //   );

    //   // Create blob from response
    //   const blob = new Blob([response.data], {
    //     type: documentObj.mimeType || "application/octet-stream",
    //   });
    //   const url = window.URL.createObjectURL(blob);

    //   // Create temporary link and click to download
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.setAttribute(
    //     "download",
    //     documentObj.originalName || documentObj.fileName
    //   );
    //   link.style.display = "none";
    //   document.body.appendChild(link);
    //   link.click();

    //   // Cleanup
    //   link.remove();
    //   window.URL.revokeObjectURL(url);

    //   toast.success("Document downloaded successfully");
    // } catch (error) {
    //   console.error("Download error:", error);
    //   toast.error("Failed to download document");
    // }
  };

  const handleViewDocument = async (documentObj) => {
    console.log(`👁️ Viewing document:`, documentObj);
    // try {
    //   console.log("👁️ Viewing document:", documentObj.originalName);

    //   // Use API call for viewing to ensure proper authentication
    //   const response = await customerService.viewCustomerDocument(
    //     id,
    //     documentObj.fileName
    //   );

    //   // Create blob from response
    //   const blob = new Blob([response.data], { type: documentObj.mimeType });
    //   const url = window.URL.createObjectURL(blob);

    //   // Open in new tab/window
    //   window.open(url, "_blank");

    //   // Cleanup after a delay to ensure the file opens
    //   setTimeout(() => {
    //     window.URL.revokeObjectURL(url);
    //   }, 1000);
    // } catch (error) {
    //   console.error("View error:", error);
    //   toast.error("Failed to view document");
    // }
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
                onClick={() => navigate("/suppliers")}
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
                onClick={() => navigate("/suppliers")}
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
                    {supplier.credit_limit || 0}
                  </div>
                  <div className="text-sm text-green-600">Advance Amount</div>
                </div>
                <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg p-4 text-center">
                  <Activity className="h-6 w-6 text-warning-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-warning-700">
                    {supplier.credit_limit || 0}
                  </div>
                  <div className="text-sm text-warning-600">
                    Outstanding Receivables
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
                      {supplier?.website ?? "Not provided"}
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
                      {supplier?.pan_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      Payments Terms
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.payment_terms ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div>
                    <p className="text-xs text-manufacturing-500 capitalize">
                      GST No.
                    </p>
                    <p className="font-medium text-manufacturing-800 text-sm">
                      {supplier?.gst_number ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <File className="h-3 w-3 text-primary-600" />
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
                            {address?.name ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.contact_person ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <PhoneCall className="h-3 w-3 text-manufacturing-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.mobile_number ?? "Not provided"}
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
                            {address?.city ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            State
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.state ?? "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Country
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm break-all">
                            {address?.country ?? "Not provided"}
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
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <Currency className="h-3 w-3 text-primary-600" />
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
                      {supplier?.notes ?? "Not provided"}
                    </p>
                  </div>
                </div>
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
                              {document.originalName}
                            </h4>
                            <div className="flex items-center text-xs text-manufacturing-500 space-x-2">
                              <span>{formatFileSize(document.size)}</span>
                              <span>•</span>
                              <span>
                                {document.mimeType
                                  ?.split("/")[1]
                                  ?.toUpperCase() || "FILE"}
                              </span>
                              <span>•</span>
                              <span>{formatDate(document.uploadDate)}</span>
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

export default ViewSupplier;
