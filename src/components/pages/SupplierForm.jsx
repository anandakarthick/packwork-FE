import React, { useEffect, useState } from "react";
import { useFieldArray, Controller } from "react-hook-form";
import {
  Hash,
  UserPlus,
  AlertCircle,
  Currency,
  CurrencyIcon,
  LucideCurrency,
  InfoIcon,
  Receipt,
  Truck,
  Plus,
  Trash2,
  FileText,
  X,
  Upload,
  Save,
  Eye,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomFieldManager from "./CustomFieldManager";

const SupplierForm = ({
  register,
  control,
  errors,
  watch,
  fields,
  append,
  remove,
  handleAddAddress,
  customer_type,
  hasGst,
  setValue,
  setError,
  clearErrors,
  uploadedDocuments,
  setUploadedDocuments,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [modalDocumentName, setModalDocumentName] = useState("");
  const [modalSelectedFiles, setModalSelectedFiles] = useState([]);
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editingDocumentName, setEditingDocumentName] = useState("");
  const [showManageModal, setShowManageModal] = useState(false);
  const [activeFieldType, setActiveFieldType] = useState("");

  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const openDocumentModal = () => {
    if (uploadedDocuments.length >= 10) {
      toast.error("Maximum 10 documents allowed.");
      return;
    }
    setShowDocumentModal(true);
    setModalDocumentName("");
    setModalSelectedFiles([]);
  };
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Limit total files to 10
    if (modalSelectedFiles.length + files.length > 10) {
      alert("You can upload a maximum of 10 files.");
      return;
    }

    setModalSelectedFiles((prev) => [...prev, ...files]);
  };

  const saveDocumentToTable = () => {
    if (modalSelectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    // Create a document object for each selected file
    const newDocuments = modalSelectedFiles.map((file) => ({
      id: Date.now() + Math.random(), // unique ID for each file
      name: file.name.split(".")[0], // you can use the file name as the document name
      file: file,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedOn: new Date(),
    }));

    // Add all new documents to uploadedDocuments
    setUploadedDocuments((prev) => [...prev, ...newDocuments]);

    // Clear modal after saving
    setModalSelectedFiles([]);
    closeDocumentModal();
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setModalDocumentName("");
    setModalSelectedFiles([]);
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = (index) => {
    if (
      window.confirm("Are you sure you want to delete this shipping address?")
    ) {
      remove(index + 1);
      if (activeIndex >= index && activeIndex > 0)
        setActiveIndex(activeIndex - 1);
    }
  };
  const handleModalFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (modalSelectedFiles.length + files.length > 10) {
      alert("You can upload a maximum of 10 files.");
      return;
    }

    setModalSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeDocument = (documentId) => {
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    toast.success("Document removed successfully!");
  };

  const handlePreview = (document) => {
    // Create object URL for preview
    const fileUrl = URL.createObjectURL(document.file);
    setPreviewFile({
      url: fileUrl,
      type: document.type,
      name: document.name,
    });
    setShowPreview(true);
  };

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setShowPreview(false);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewFile?.url) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  // Add this to check if file is previewable
  const isPreviewable = (document) => {
    const previewableTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    return previewableTypes.includes(document.type);
  };
  const handleFetchGST = () => {
    console.log("Fetch GST clicked");
  };

  const handleFieldAdded = () => {
    console.log(`Field added - function not implemented`);
  };

  const handleRefresh = () => {
    console.log(`Field removed - function not implemented`);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Customer ID Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="w-full bg-primary-50 border border-primary-200 rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary-600" />
              <div>
                <h4 className="text-xs font-medium text-primary-800">
                  {customer_type
                    ? `${customer_type
                        .charAt(0)
                        .toUpperCase()}${customer_type.slice(1)} ID`
                    : "Customer ID"}
                </h4>
                <p className="text-xs text-primary-600">Auto-generated</p>
              </div>
            </div>
            <div className="text-base font-semibold text-primary-700 font-mono">
              {watch("customer_reference_number") ||
              customer_type === "supplier"
                ? "SUP#001"
                : "CUS#001"}
            </div>
          </div>
          <div className="card-corrugated p-4 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {/* --- Column 1: Do you have GST? --- */}
              <div className="flex flex-col justify-center min-w-[180px]">
                <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                  Do you have GST?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="true"
                      {...register("has_gst")}
                      checked={hasGst === "true" || hasGst === true}
                      onChange={() => setValue("has_gst", true)}
                      className="mr-1.5 h-3 w-3 text-corrugated-600 focus:ring-corrugated-500 border-gray-300"
                    />
                    <span className="text-xs text-manufacturing-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="false"
                      {...register("has_gst")}
                      checked={hasGst === "false" || hasGst === false}
                      onChange={() => setValue("has_gst", false)}
                      className="mr-1.5 h-3 w-3 text-corrugated-600 focus:ring-corrugated-500 border-gray-300"
                    />
                    <span className="text-xs text-manufacturing-700">No</span>
                  </label>
                </div>
              </div>

              {/* --- Column 2: GST Number --- */}
              {(hasGst === true || hasGst === "true") && (
                <div className="flex flex-col justify-center min-w-[220px]">
                  <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                    GST Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("gst_number", {
                      required: "GST number is required",
                    })}
                    className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors w-full ${
                      errors.gst_number
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Enter GST number"
                  />
                  {errors.gst_number && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.gst_number.message}
                    </p>
                  )}
                </div>
              )}

              {/* --- Column 3: Fetch Button --- */}
              {(hasGst === true || hasGst === "true") && (
                <div className="flex items-center ml-6">
                  <button
                    type="button"
                    onClick={handleFetchGST}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-corrugated-600 text-white hover:bg-corrugated-700"
                  >
                    Fetch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card-corrugated p-4 space-y-3">
          <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
            <div className="bg-primary-100 rounded-full p-1 mr-2">
              <InfoIcon className="h-3 w-3 text-primary-600" />
            </div>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("customer_name", {
                  required: "Supplier name is required",
                })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.customer_name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter Supplier name"
              />
              {errors.customer_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customer_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Business Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("business_type", {
                  required: "Business type is required",
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "manage") {
                    setActiveFieldType("business_type");
                    setShowManageModal(true); // ✅ Open modal
                    setValue("business_type", ""); // Clear the selection
                  } else {
                    setValue("business_type", value);
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors"
              >
                <option value="">Select Business Type</option>
                <option
                  value="manage"
                  className="text-primary-600 font-semibold"
                >
                  ➕ Manage
                </option>
                <option value="E-commerce">E-commerce</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
              </select>

              {errors.business_type && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.business_type.message}
                </p>
              )}

              {/* --- Custom Field Modal --- */}
              {showManageModal && (
                <CustomFieldManager
                  isOpen={showManageModal}
                  onClose={() => setShowManageModal(false)}
                  onFieldAdded={handleFieldAdded}
                  fieldType="business_type"
                  onRefresh={handleRefresh}
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email_id", { required: "Email is required" })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.email_id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="supplier@example.com"
              />
              {errors.email_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("mobile_number", {
                  required: "Phone number is required",
                })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.mobile_number
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="+91-9876543210"
              />
              {errors.mobile_number && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.mobile_number.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                {...register("alternative_mobile_number")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 hover:border-gray-400 transition-colors"
                placeholder="+91-9876543211"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Website
              </label>
              <input
                type="text"
                {...register("website")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 hover:border-gray-400 transition-colors"
                placeholder="Enter Website URL"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-corrugated p-4 space-y-3">
          <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
            <div className="bg-primary-100 rounded-full p-1 mr-2">
              <LucideCurrency className="h-3 w-3 text-primary-600" />
            </div>
            Financial Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Pan Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("pan_number", {
                  required: "Pan number is required",
                })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.pan_number
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter pan number"
              />
              {errors.pan_number && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.pan_number.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                {...register("payment_terms", {
                  required: "Payment terms is required",
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "manage") {
                    setActiveFieldType("payment_terms");
                    setShowManageModal(true); // ✅ Open modal
                    setValue("payment_terms", ""); // Clear the selection
                  } else {
                    setValue("payment_terms", value);
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors"
              >
                <option value="">Select Payment Terms</option>
                <option
                  value="manage"
                  className="text-primary-600 font-semibold"
                >
                  ➕ Manage
                </option>
                <option value="Net-30">Net-30</option>
                <option value="Net-45">Net-45</option>
              </select>

              {errors.payment_terms && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.payment_terms.message}
                </p>
              )}

              {/* --- Custom Field Modal --- */}
              {showManageModal && (
                <CustomFieldManager
                  isOpen={showManageModal}
                  onClose={() => setShowManageModal(false)}
                  onFieldAdded={handleFieldAdded}
                  fieldType="business_type"
                  onRefresh={handleRefresh}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Lead Time (Days)
              </label>
              <input
                type="text"
                {...register("credit_limit")}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors`}
                placeholder="Enter Lead Time"
              />
            </div>

            {/* Notes - spans 2.5 columns */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 hover:border-gray-400 transition-colors resize-none"
                placeholder="Enter notes"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full card-corrugated p-4 space-y-3">
            <h3 className="text-base font-medium text-manufacturing-800 mb-2 pb-2 border-b border-manufacturing-200 flex items-center">
              <div className="bg-primary-100 rounded-full p-1 mr-2">
                <Receipt className="h-3 w-3 text-primary-600" />
              </div>
              Address Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.contact_person_name`, {
                    required: "Contact person name is required",
                  })}
                  placeholder="Enter contact person name"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.contact_person_name
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.contact_person_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.contact_person_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.phone`, {
                    required: "Phone number is required",
                  })}
                  placeholder="Enter Phone Number"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.email`, {
                    required: "Email is required",
                  })}
                  placeholder="Enter Email Address"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.pincode`, {
                    required: "Pincode is required",
                  })}
                  placeholder="Enter 6 digit Pincode"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.pincode
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.pincode && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.pincode.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register(`addresses.0.address`, {
                    required: "Address is required",
                  })}
                  rows={2}
                  placeholder="Enter Billing Address"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors resize-none ${
                    errors.addresses?.[0]?.address
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.address && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.city`, {
                    required: "City is required",
                  })}
                  placeholder="Enter City"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.city
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.city && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.state`, {
                    required: "State is required",
                  })}
                  placeholder="Select State"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.state
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.state && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  {...register(`addresses.0.country`, {
                    required: "Country is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.country
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
                {errors.addresses?.[0]?.country && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.country.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card-corrugated p-6 lg:col-span-2">
          <h3 className="text-base font-medium text-manufacturing-800 mb-6 pb-3 border-b border-manufacturing-200 flex items-center justify-between">
            <span className="flex items-center">
              <div className="bg-primary-100 rounded-full p-1 mr-2">
                <FileText className="h-4 w-4" />
              </div>
              Document Upload
            </span>
            <button
              type="button"
              onClick={openDocumentModal}
              className="px-4 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </button>
          </h3>

          <div className="space-y-4">
            {/* Documents Table */}
            {uploadedDocuments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded On
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {uploadedDocuments.map((document, index) => (
                      <tr
                        key={document.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-corrugated-600 mr-3 flex-shrink-0" />
                            <div>
                              {editingDocumentId === document.id ? (
                                <input
                                  type="text"
                                  value={editingDocumentName}
                                  autoFocus
                                  onChange={(e) =>
                                    setEditingDocumentName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      // Update UI
                                      setUploadedDocuments((prev) =>
                                        prev.map((doc) =>
                                          doc.id === document.id
                                            ? {
                                                ...doc,
                                                name: editingDocumentName,
                                              }
                                            : doc
                                        )
                                      );

                                      // If using useForm, update the form value here
                                      setValue(
                                        `documents.${document.id}.name`,
                                        editingDocumentName
                                      );

                                      // Exit edit mode
                                      setEditingDocumentId(null);
                                      setEditingDocumentName("");
                                    }
                                    if (e.key === "Escape") {
                                      setEditingDocumentId(null);
                                      setEditingDocumentName("");
                                    }
                                  }}
                                  className="text-sm font-medium border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-corrugated-600 rounded"
                                />
                              ) : (
                                <>
                                  <div className="text-sm font-medium text-gray-900">
                                    {document.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {document.originalName}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {document.type.split("/")[1].toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(document.size)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.uploadedOn.toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {isPreviewable(document) && (
                              <button
                                type="button"
                                onClick={() => handlePreview(document)}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                                title="Preview document"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDocumentId(document.id);
                                setEditingDocumentName(document.name);
                              }}
                              className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-full transition-colors"
                              title="Edit document name"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(document.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                              title="Remove document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  No documents uploaded yet
                </p>
                <p className="text-xs text-gray-500">
                  Click "Add Document" to upload your first document
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b flex-shrink-0 rounded-t-lg">
              <h3 className="text-lg font-semibold text-manufacturing-800">
                Add Document
              </h3>
              <button
                onClick={closeDocumentModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-6 space-y-4 overflow-auto">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-manufacturing-700 mb-1">
                  Select File *
                </label>
                <div
                  className="rounded-lg p-6 text-center hover:border-corrugated-500 transition-colors"
                  onDrop={handleModalFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                >
                  {/* Upload Button */}
                  {modalSelectedFiles.length < 10 && (
                    <div className="space-y-4">
                      <label
                        htmlFor="modal-document-upload"
                        className="space-y-4 block border-2 rounded-lg p-6 text-center cursor-pointer hover:border-corrugated-600 transition-colors"
                      >
                        <div className="flex items-center justify-center">
                          <Upload className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-manufacturing-600 mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-manufacturing-500">
                            PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
                          </p>
                        </div>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          id="modal-document-upload"
                        />
                      </label>
                    </div>
                  )}

                  {/* Uploaded Files List */}
                  {modalSelectedFiles.length > 0 && (
                    <div className="mt-4 max-h-64 overflow-auto space-y-2">
                      {modalSelectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-manufacturing-800">
                              {file.name}
                            </p>
                            <p className="text-xs text-manufacturing-500">
                              {formatFileSize(file.size)} •{" "}
                              {file.type.split("/")[1].toUpperCase()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setModalSelectedFiles(
                                modalSelectedFiles.filter((_, i) => i !== index)
                              )
                            }
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex justify-end space-x-3 p-3 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
              <button
                type="button"
                onClick={closeDocumentModal}
                className="px-4 py-1.5 text-manufacturing-600 border border-manufacturing-300 rounded-lg hover:bg-manufacturing-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDocumentToTable}
                className="px-6 py-1.5 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-manufacturing-800">
                Preview: {previewFile.name}
              </h3>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {previewFile.type.startsWith("image/") ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewFile.type === "application/pdf" ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-[600px]"
                />
              ) : (
                <div className="text-center py-20">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Preview not available for{" "}
                    {previewFile.type.split("/")[1].toUpperCase()} files
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    DOC and DOCX files cannot be previewed in browser
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showManageModal && (
        <CustomFieldManager
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          onFieldAdded={handleFieldAdded}
          fieldType={activeFieldType}
          onRefresh={handleRefresh}
        />
      )}
    </>
  );
};

export default SupplierForm;
