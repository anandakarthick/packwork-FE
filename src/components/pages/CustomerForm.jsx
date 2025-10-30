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
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomFieldManager from "./CustomFieldManager";
import { CommonService } from "../../services/CommonServices";
import { ClientService } from "../../services/ClientServices";
const CustomerForm = ({
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
  uploadedDocuments,
  setUploadedDocuments,
  getValues,
  paymentTerms,
  businessTypes,
  countries,
  states,
  cities,
  setCountries,
  setStates,
  setCities,
  addressOptions,
  setAddressOptions,
  id,
  clearErrors,
  reset,
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
  const fetchStates = async (countryId, index, preloadCity = true) => {
    try {
      const res = await CommonService.getStatesByCountry(countryId);
      if (res.success) {
        setAddressOptions((prev) => {
          const updated = [...prev];
          updated[index] = updated[index] || { states: [], cities: [] };
          updated[index].states = res.data;
          updated[index].cities = [];
          return updated;
        });

        const selectedStateId = getValues(`addresses.${index}.state_id`);
        if (selectedStateId) {
          // ✅ Wait for dropdown render
          setTimeout(() => {
            setValue(`addresses.${index}.state_id`, selectedStateId);
          }, 100);

          if (preloadCity) {
            // ✅ Wait for state value to settle before loading cities
            setTimeout(() => {
              fetchCities(selectedStateId, index, true);
            }, 200);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchCities = async (stateId, index, setSelectedCity = false) => {
    try {
      const res = await CommonService.getCitiesByState(stateId);
      if (res.success) {
        setAddressOptions((prev) => {
          const updated = [...prev];
          updated[index] = updated[index] || { states: [], cities: [] };
          updated[index].cities = res.data;
          return updated;
        });

        if (setSelectedCity) {
          const selectedCityId = getValues(`addresses.${index}.city_id`);
          if (selectedCityId) {
            setTimeout(() => {
              setValue(`addresses.${index}.city_id`, selectedCityId);
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  useEffect(() => {
    const initializeAddresses = async () => {
      if (countries.length === 1) {
        const singleCountryId = countries[0].id;

        // ✅ First address – wait till done
        setValue("addresses.0.country_id", singleCountryId);
        await fetchStates(singleCountryId, 0);

        // ✅ Then preload the rest
        for (let i = 1; i < fields.length; i++) {
          setValue(`addresses.${i}.country_id`, singleCountryId);
          await fetchStates(singleCountryId, i);
        }
      }
    };

    initializeAddresses();
  }, [countries]);

  useEffect(() => {
    fields.forEach(async (field, index) => {
      if (countries.length === 1 && index === 0) return; // ✅ skip first when already initialized

      const countryId = getValues(`addresses.${index}.country_id`);
      const stateId = getValues(`addresses.${index}.state_id`);
      const cityId = getValues(`addresses.${index}.city_id`);

      if (countryId) {
        await fetchStates(countryId, index, false);
        if (stateId) await fetchCities(stateId, index, true);
      }
    });
  }, [fields]);

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

  const handleDelete = (index, address) => {
    console.log(index, address);
    if (
      window.confirm("Are you sure you want to delete this shipping address?")
    ) {
      if (address?.id) {
        ClientService.deleteAddress(address.id);
      }
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

  const removeDocument = (document) => {
    console.log(document);
    if (document?.document_id) {
      ClientService.deleteCustomerDocumentsLinks(document.id);
      CommonService.deleteDocuemnts(document.document_id);
      setUploadedDocuments((prev) =>
        prev.filter((doc) => doc.id !== document.id)
      );
      toast.success("Document removed successfully!");
    } else {
      setUploadedDocuments((prev) =>
        prev.filter((doc) => doc.id !== document.id)
      );
      toast.success("Document removed successfully!");
    }
  };

  const handlePreview = (document) => {
    console.log(document);
    let fileUrl = "";
    if (document.file instanceof File) {
      fileUrl = URL.createObjectURL(document.file);
    } else if (document.document_id) {
      fileUrl = document.url;
    } else {
      toast.error("Preview not available for this file");
      return;
    }

    setPreviewFile({
      url: fileUrl,
      type: document.type,
      name: document.name || document.originalName || "Document",
      isFromServer: !!document.url,
    });

    setShowPreview(true);
  };

  const closePreview = () => {
    if (previewFile?.url && !previewFile?.isFromServer) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setShowPreview(false);
  };

  useEffect(() => {
    return () => {
      if (previewFile?.url && !previewFile?.isFromServer) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  const isPreviewable = (document) => {
    const previewableTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    return previewableTypes.includes(document.type);
  };

  const handleCopyBillingToShipping = async () => {
    const billing = getValues("addresses.0");
    if (!billing) return;

    try {
      // set state first
      setValue("addresses.1.state_id", billing.state_id || "");

      // ✅ Pass `true` as third argument so city gets set after cities load
      await fetchCities(billing.state_id, 1, true);

      // Copy other fields
      setValue(
        "addresses.1.contact_person_name",
        billing.contact_person_name || ""
      );
      setValue(
        "addresses.1.contact_person_mobile_number",
        billing.contact_person_mobile_number || ""
      );
      setValue("addresses.1.contact_email", billing.contact_email || "");
      setValue("addresses.1.address", billing.address || "");
      setValue("addresses.1.country_id", billing.country_id || "");
      setValue("addresses.1.pincode", billing.pincode || "");
      setTimeout(() => {
        setValue("addresses.1.city_id", billing.city_id || "");
      }, 500);
      

      // Clear validation errors for shipping fields
      [
        "contact_person_name",
        "contact_person_mobile_number",
        "contact_email",
        "address",
        "city_id",
        "state_id",
        "pincode",
        "country_id",
      ].forEach((field) => clearErrors(`addresses.1.${field}`));
    } catch (error) {
      console.error("Error while copying billing to shipping:", error);
    }
  };

  const handleFetchGST = async () => {
    console.log("Fetch GST clicked", watch("gst_number"));
    try {
      const response = await CommonService.checkGSTIN(watch("gst_number"));
      console.log("Response:", response);

      if (response?.flag) {
        const gstData = response.data;

        // ✅ Set GST Number
        setValue("gst_number", gstData.gstin);

        // ✅ Set Company Name (use tradeNam if available, else legal name)
        setValue("company_name", gstData.tradeNam || gstData.lgnm || "");

        // ✅ Optional: Set Address Fields if available
        // if (gstData.pradr?.addr) {
        //   const addr = gstData.pradr.addr;
        //   setValue("address_line1", `${addr.bnm || ""} ${addr.bno || ""} ${addr.st || ""}`.trim());
        //   setValue("city", addr.loc || addr.dst || "");
        //   setValue("state", addr.stcd || "");
        //   setValue("pincode", addr.pncd || "");
        // }

        toast.success("GSTIN fetched successfully!");
      } else {
        // ❌ Show message from API (like invalid API key)
        toast.error(response?.message || "Failed to fetch GST details");
      }
    } catch (error) {
      console.error("Error fetching GSTIN:", error);
      toast.error("Error fetching GSTIN");
    }
  };

  const handleFieldAdded = async () => {
    console.log(`✅ Field added - refreshing config data`);
    // Call the reset function passed from parent to refetch data
    if (reset && typeof reset === "function") {
      await reset();
    }
  };

  const handleRefresh = async () => {
    console.log(`✅ Field updated/deleted - refreshing config data`);
    // Call the reset function passed from parent to refetch data
    if (reset && typeof reset === "function") {
      await reset();
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Customer ID Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {id && (
            <div className="w-full bg-primary-50 border border-primary-200 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary-600" />
                <div>
                  <h4 className="text-xs font-medium text-primary-800">
                    Client ID
                  </h4>
                  <p className="text-xs text-primary-600">Auto-generated</p>
                </div>
              </div>
              <div className="text-base font-semibold text-primary-700 font-mono">
                {watch("customer_reference_number") || "CLI#001"}
              </div>
            </div>
          )}
          <div className="card-corrugated p-4 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {/* --- Column 1: Do you have GST? --- */}
              <div className="flex flex-col justify-center min-w-[180px]">
                <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                  Do you have GST?
                </label>
                <div className="flex space-x-4">
                  {/* ✅ Yes Option */}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="true"
                      checked={hasGst === true}
                      onChange={() => {
                        setValue("has_gst", true); // ✅ sets boolean true
                      }}
                      className="mr-1.5 h-3 w-3 text-corrugated-600 focus:ring-corrugated-500 border-gray-300"
                    />
                    <span className="text-xs text-manufacturing-700">Yes</span>
                  </label>

                  {/* ✅ No Option */}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="false"
                      checked={hasGst === false}
                      onChange={() => {
                        setValue("has_gst", false); // ✅ sets boolean false
                        setValue("gst_number", ""); // ✅ clears GST number
                      }}
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
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("customer_name", {
                  required: "Client name is required",
                })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.customer_name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter client name"
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
                {...register("business_type_id", {
                  required: "Business type is required",
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "manage") {
                    setActiveFieldType("business_type");
                    setShowManageModal(true); // ✅ Open modal
                    setValue("business_type_id", "");
                  } else {
                    setValue("business_type_id", value);
                    clearErrors("business_type_id");
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
                {businessTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_label}
                  </option>
                ))}
              </select>

              {errors.business_type_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.business_type_id.message}
                </p>
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
                placeholder="client@example.com"
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
                  required: "Mobile number is required",
                })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.mobile_number
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="9876543210"
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
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.alternative_mobile_number
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="9876543211"
              />
              {errors.alternative_mobile_number && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.alternative_mobile_number.message}
                </p>
              )}
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
                Credit Limit
              </label>
              <input
                type="text"
                {...register("credit_limit")}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.credit_limit
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter credit limit"
              />
              {errors.credit_limit && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.credit_limit.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                {...register("payment_term_id", {
                  required: "Payment terms is required",
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "manage") {
                    setActiveFieldType("payment_terms");
                    setShowManageModal(true); // ✅ Open modal
                    setValue("payment_term_id", "");
                  } else {
                    setValue("payment_term_id", value);
                    clearErrors("payment_term_id");
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
                {paymentTerms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.display_label}
                  </option>
                ))}
              </select>

              {errors.payment_term_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.payment_term_id.message}
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
          </div>
        </div>
        <div className="card-corrugated p-4 space-y-3">
          <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
            <div className="bg-primary-100 rounded-full p-1 mr-2">
              <FileText className="h-3 w-3 text-primary-600" />
            </div>
            Additional Information
          </h3>

          <div className="grid grid-cols-5 gap-4">
            {/* Notes - spans 2.5 columns */}
            <div className="col-span-3 lg:col-span-[2.5]">
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

            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Website
              </label>
              <input
                type="text"
                {...register("website")}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.website
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter Website URL"
              />
              {errors.website && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.website.message}
                </p>
              )}
            </div>

            {/* Status - 5th column */}
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Status
              </label>
              <select
                {...register("is_active")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors`}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 card-corrugated p-4 space-y-3">
            <h3 className="text-base font-medium text-manufacturing-800 mb-2 pb-2 border-b border-manufacturing-200 flex items-center">
              <div className="bg-primary-100 rounded-full p-1 mr-2">
                <Receipt className="h-3 w-3 text-primary-600" />
              </div>
              Billing Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  {...register(`addresses.0.contact_person_mobile_number`, {
                    required: "Phone number is required",
                  })}
                  placeholder="Enter Phone Number"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.contact_person_mobile_number
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.contact_person_mobile_number && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {
                      errors.addresses?.[0]?.contact_person_mobile_number
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register(`addresses.0.contact_email`, {
                    required: "Email address is required",
                  })}
                  placeholder="Enter Email Address"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.contact_email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                {errors.addresses?.[0]?.contact_email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.contact_email.message}
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
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  {...register(`addresses.0.country_id`, {
                    required: "Country is required",
                  })}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue(`addresses.0.country_id`, value);
                    fetchStates(value, 0);
                    clearErrors(`addresses.0.country_id`);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.country_id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="">Select Country</option>s
                  {countries.length > 0 &&
                    countries.map((country, index) => (
                      <option key={index} value={country.id}>
                        {country.country_name}
                      </option>
                    ))}
                </select>
                {errors.addresses?.[0]?.country_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.country_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  {...register(`addresses.0.state_id`, {
                    required: "state is required",
                  })}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue(`addresses.0.state_id`, value);
                    fetchCities(value, 0);
                    clearErrors(`addresses.0.state_id`);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.state_id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="">Select State</option>
                  {addressOptions[0]?.states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.state_name}
                    </option>
                  ))}
                </select>
                {errors.addresses?.[0]?.state_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.state_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  {...register(`addresses.0.city_id`, {
                    required: "city is required",
                  })}
                  onChange={() => {
                    clearErrors(`addresses.0.city_id`);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                    errors.addresses?.[0]?.city_id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="">Select City</option>
                  {addressOptions[0]?.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
                {errors.addresses?.[0]?.city_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.addresses?.[0]?.city_id.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 card-corrugated p-4 space-y-3">
            <h3 className="text-base font-medium text-manufacturing-800 border-b border-manufacturing-200 flex items-center justify-between pb-2 mb-2">
              <span className="flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <Truck className="h-3 w-3 text-primary-600" />
                </div>
                <span className="flex items-center gap-2">
                  Shipping Address
                  {activeIndex === 0 && (
                    <button
                      type="button"
                      onClick={handleCopyBillingToShipping}
                      title="Copy from Billing Address"
                      className="text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </span>
              </span>

              <div
                className="flex flex-nowrap items-center gap-2 overflow-x-auto max-w-[320px] pb-1"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d1d5db transparent",
                }}
              >
                {fields.slice(1).map((address, index) => (
                  <button
                    key={address.formKey}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center gap-1 flex-shrink-0 ${
                      activeIndex === index
                        ? "bg-corrugated-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Shipping {index + 1}
                    {fields.length > 2 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(index, address);
                          if (activeIndex === index && index > 0) {
                            setActiveIndex(index - 1);
                          } else if (activeIndex > index) {
                            setActiveIndex(activeIndex - 1);
                          }
                        }}
                        className="ml-1 p-0.5 hover:bg-red-200 rounded-full cursor-pointer"
                      >
                        <X className="h-2 w-2" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddAddress}
                className="px-2 py-1 text-xs bg-[#b36735] text-white rounded hover:bg-[#9a5329] transition-all duration-200 font-medium flex items-center flex-shrink-0 ml-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </button>
            </h3>

            {fields.slice(1).map((address, index) => {
              const actualIndex = index + 1;
              if (index !== activeIndex) return null;

              return (
                <div key={address.id} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(
                          `addresses.${actualIndex}.contact_person_name`,
                          {
                            required: "Contact person name is required",
                          }
                        )}
                        placeholder="Enter Contact person name"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors.addresses?.[actualIndex]?.contact_person_name
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.addresses?.[actualIndex]?.contact_person_name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.addresses?.[actualIndex]?.contact_person_name
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        Location name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`addresses.${actualIndex}.location_name`, {
                          required: "Location name is required",
                        })}
                        placeholder="Enter Location name"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors.addresses?.[actualIndex]?.location_name
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.addresses?.[actualIndex]?.location_name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.addresses?.[actualIndex]?.location_name
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        Location code <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`addresses.${actualIndex}.location_code`, {
                          required: "Location code is required",
                        })}
                        placeholder="Enter Location code"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors.addresses?.[actualIndex]?.location_code
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.addresses?.[actualIndex]?.location_code && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.addresses?.[actualIndex]?.location_code
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(
                          `addresses.${actualIndex}.contact_person_mobile_number`,
                          {
                            required: "Phone number is required",
                          }
                        )}
                        placeholder="Enter Contact person Phone Number"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors.addresses?.[actualIndex]
                            ?.contact_person_mobile_number
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.addresses?.[actualIndex]
                        ?.contact_person_mobile_number && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.addresses?.[actualIndex]
                              ?.contact_person_mobile_number.message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`addresses.${actualIndex}.contact_email`, {
                          required: "Email is required",
                        })}
                        placeholder="Enter Email Address"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors.addresses?.[actualIndex]?.contact_email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.addresses?.[actualIndex]?.contact_email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.addresses?.[actualIndex]?.contact_email
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`addresses.${actualIndex}.address`, {
                        required: "Address is required",
                      })}
                      placeholder="Enter Shipping Address"
                      rows={2}
                      className={`w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                        errors.addresses?.[actualIndex]?.address
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.addresses?.[actualIndex]?.address && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.addresses?.[actualIndex]?.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(`addresses.${actualIndex}.country_id`, {
                          required: "Country is required",
                        })}
                        onChange={(e) => {
                          const value = e.target.value;
                          setValue(
                            `addresses.${actualIndex}.country_id`,
                            value
                          );
                          fetchStates(value, actualIndex);
                          clearErrors(`addresses.${actualIndex}.country_id`);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.country_name}
                          </option>
                        ))}
                      </select>

                      {errors.addresses?.[actualIndex]?.country_id && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.addresses?.[actualIndex]?.country_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(`addresses.${actualIndex}.state_id`, {
                          required: "State is required",
                        })}
                        onChange={(e) => {
                          const value = e.target.value;
                          setValue(`addresses.${actualIndex}.state_id`, value);
                          fetchCities(value, actualIndex);
                          clearErrors(`addresses.${actualIndex}.state_id`);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select State</option>
                        {addressOptions[actualIndex]?.states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.state_name}
                          </option>
                        ))}
                      </select>

                      {errors.addresses?.[actualIndex]?.state_id && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.addresses?.[actualIndex]?.state_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(`addresses.${actualIndex}.city_id`, {
                          required: "City is required",
                        })}
                        onChange={() => {
                          clearErrors(`addresses.${actualIndex}.city_id`);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select City</option>
                        {addressOptions[actualIndex]?.cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.city_name}
                          </option>
                        ))}
                      </select>

                      {errors.addresses?.[actualIndex]?.city_id && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.addresses?.[actualIndex]?.city_id.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`addresses.${actualIndex}.pincode`, {
                          required: "Pincode is required",
                        })}
                        placeholder="Enter 6 digit Pincode"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors.addresses?.[actualIndex]?.pincode
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.addresses?.[actualIndex]?.pincode && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.addresses?.[actualIndex]?.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card-corrugated p-6 lg:col-span-2">
          <h3 className="text-base font-medium text-manufacturing-800 mb-6 pb-3 border-b border-manufacturing-200 flex items-center justify-between">
            <span className="flex items-center">
              <div className="bg-purple-100 rounded-full p-1 mr-2">
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
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault(); // ✅ Prevent accidental form submit
                                      if (!editingDocumentName?.trim()) {
                                        toast.error(
                                          "Document name cannot be empty!"
                                        );
                                        return;
                                      }

                                      try {
                                        console.log(
                                          "Editing Document:",
                                          document
                                        );

                                        // ✅ Only call API if document has an ID (i.e., it's saved on the server)
                                        if (document?.document_id) {
                                          const response =
                                            await CommonService.updateDocuments(
                                              document.document_id,
                                              {
                                                document_name:
                                                  editingDocumentName.trim(),
                                              }
                                            );

                                          if (response?.success) {
                                            toast.success(
                                              "Document name updated successfully!"
                                            );
                                          } else {
                                            toast.error(
                                              response?.message ||
                                                "Failed to update document name."
                                            );
                                            return;
                                          }
                                        }

                                        // ✅ Update local state immediately for UI feedback
                                        setUploadedDocuments((prev) =>
                                          prev.map((doc) =>
                                            doc.id === document.id
                                              ? {
                                                  ...doc,
                                                  name: editingDocumentName.trim(),
                                                }
                                              : doc
                                          )
                                        );

                                        // ✅ Sync with form if you're using react-hook-form
                                        if (setValue) {
                                          setValue(
                                            `documents.${document.id}.name`,
                                            editingDocumentName.trim()
                                          );
                                        }

                                        // ✅ Exit edit mode
                                        setEditingDocumentId(null);
                                        setEditingDocumentName("");
                                      } catch (err) {
                                        console.error(
                                          "Error updating document:",
                                          err
                                        );
                                        toast.error(
                                          "An unexpected error occurred while updating the document."
                                        );
                                      }
                                    }

                                    // ✅ Escape key to cancel editing
                                    if (e.key === "Escape") {
                                      e.preventDefault();
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
                                setEditingDocumentName(document.document_name);
                              }}
                              className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-full transition-colors"
                              title="Edit document name"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(document)}
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

export default CustomerForm;
