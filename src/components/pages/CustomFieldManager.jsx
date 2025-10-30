import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { CommonService } from "../../services/CommonServices";

const CustomFieldManager = ({
  isOpen,
  onClose,
  onFieldAdded,
  fieldType,
  title = "Manage Custom Fields",
  onRefresh,
  reset,
}) => {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    displayLabel: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [deletingField, setDeletingField] = useState(null);
  const [currentDefaultField, setCurrentDefaultField] = useState(null);

  const getFieldConfig = () => {
    switch (fieldType) {
      case "payment_terms":
        return {
          modelName: "Supplier",
          fieldName: "custom_payment_terms",
          title: "Manage Payment Terms",
          description: "Add and manage your custom payment terms options",
          placeholder: "Enter payment terms (e.g., 30, 60, 90)",
          displayPlaceholder: "Enter display label (e.g., Net 30, 60 Days)",
          apiEndpoint: "supplier-payment-terms",
          showSeparateValue: true, // Show separate value input
          valueType: "number", // Number input for value
        };
      case "supplier_type":
        return {
          modelName: "Supplier",
          fieldName: "custom_supplier_type",
          title: "Manage Supplier Types",
          description: "Add and manage your custom supplier type options",
          placeholder: "Enter supplier type (e.g., Preferred Vendor)",
          displayPlaceholder: "",
          apiEndpoint: "supplier-types",
          showSeparateValue: false, // Use display label for both
          valueType: "text",
        };
      case "business_type":
        return {
          modelName: "Supplier",
          fieldName: "custom_business_type",
          title: "Manage Business Types",
          description: "Add and manage your custom business type options",
          placeholder: "Enter business type (e.g., Wholesale Dealer)",
          displayPlaceholder: "",
          apiEndpoint: "supplier-business-types",
          showSeparateValue: false, // Use display label for both
          valueType: "text",
        };
      default:
        return {
          modelName: "Generic",
          fieldName: "custom_field",
          title: "Manage Custom Fields",
          description: "Add and manage your custom field options",
          placeholder: "Enter field value",
          displayPlaceholder: "Enter display label",
          apiEndpoint: "custom-fields",
          showSeparateValue: true,
          valueType: "text",
        };
    }
  };

  const config = getFieldConfig();

  useEffect(() => {
    if (isOpen) {
      fetchCustomFields();
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, fieldType]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching custom fields for: ${fieldType}`);

      const response = await CommonService.getGroupedConfigs();

      if (response.success && response.data) {
        const fields = response.data[fieldType] || [];

        setCustomFields(fields);
        console.log(`✅ Loaded ${fieldType}:`, fields);

        const defaultField = fields.find((field) => field.is_default === 1);
        setCurrentDefaultField(defaultField || null);
      } else {
        console.warn(`⚠️ No data found for ${fieldType}`);
        setCustomFields([]);
      }
    } catch (error) {
      console.error(`❌ Error fetching custom ${fieldType}:`, error);
      toast.error(`Failed to load ${fieldType}`);
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // For fields that don't show separate value input, use displayLabel for both
    const valueToCheck = config.showSeparateValue
      ? formData.value.trim()
      : formData.displayLabel.trim();

    if (!valueToCheck) {
      if (config.showSeparateValue) {
        errors.value = `Value is required`;
      } else {
        errors.displayLabel = `${fieldType.replace("_", " ")} name is required`;
      }
    }

    if (config.showSeparateValue && !formData.displayLabel.trim()) {
      errors.displayLabel = `Display label is required`;
    }

    // Check for duplicate config_value
    if (valueToCheck) {
      const duplicateExists = customFields.some(
        (field) =>
          field.config_value.toLowerCase() === valueToCheck.toLowerCase() &&
          (!editingField || field.id !== editingField.id)
      );

      if (duplicateExists) {
        const errorKey = config.showSeparateValue ? "value" : "displayLabel";
        errors[errorKey] = "This value already exists";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    try {
      // For fields without separate value input, use displayLabel for both
      const configValue = config.showSeparateValue
        ? formData.value.trim()
        : formData.displayLabel.trim();

      const displayLabel = config.showSeparateValue
        ? formData.displayLabel.trim()
        : formData.displayLabel.trim();

      const submitData = {
        config_key: fieldType,
        config_value: configValue,
        display_label: displayLabel,
        order: editingField ? editingField.order : customFields.length + 1,
        is_default: 0,
        is_active: 1,
      };

      let response;
      if (editingField) {
        response = await CommonService.updateConfig(
          editingField.id,
          submitData
        );
        toast.success(`"${submitData.display_label}" updated successfully!`);
      } else {
        response = await CommonService.createConfig(submitData);
        toast.success(`"${submitData.display_label}" created successfully!`);
      }

      if (response.success) {
        await fetchCustomFields();

        if (onFieldAdded && !editingField) {
          onFieldAdded({
            id: response.data.id,
            config_key: fieldType,
            config_value: submitData.config_value,
            display_label: submitData.display_label,
            type: "custom",
            isCustom: true,
          });
        }
        if (editingField && onRefresh) {
          onRefresh();
        }

        // Reset form
        setFormData({ value: "", displayLabel: "" });
        setFormErrors({});
        setEditingField(null);

        if (reset) {
          reset();
        }
      }
    } catch (error) {
      console.error(`Error saving ${fieldType}:`, error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${editingField ? "update" : "create"} ${fieldType.replace(
            "_",
            " "
          )}`
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (field) => {
    console.log(`field that are to be edited`, field);
    setEditingField(field);

    // For fields without separate value, set displayLabel only
    if (config.showSeparateValue) {
      setFormData({
        value: field.config_value,
        displayLabel: field.display_label,
      });
    } else {
      setFormData({
        value: "",
        displayLabel: field.display_label,
      });
    }

    const modalContent = document.querySelector(".custom-field-modal-content");
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFormData({ value: "", displayLabel: "" });
    setFormErrors({});
  };

  const handleDelete = async (field) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${field.display_label}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingField(field.id);
    try {
      const response = await CommonService.deleteConfig(field.id);

      if (response.success) {
        toast.success(`"${field.display_label}" deleted successfully!`);
        await fetchCustomFields();

        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(
          response.message || `Failed to delete ${fieldType.replace("_", " ")}`
        );
      }
    } catch (error) {
      console.error(`Error deleting ${fieldType}:`, error);
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${fieldType.replace("_", " ")}`
      );
    } finally {
      setDeletingField(null);
    }
  };

  const handleSetAsDefault = async (customField) => {
    console.log(
      `Set as default for - function not implemented (commented out)`
    );
    // TODO: Implement set as default functionality
  };

  const isCurrentDefault = (field) => {
    return field.is_default === 1;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-15 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 text-white rounded-t-xl"
          style={{ background: "linear-gradient(to right, #b36735, #a05d30)" }}
        >
          <div>
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {config.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-field-modal-content">
          {/* Add/Edit Form */}
          <div className="space-y-3 mb-6">
            {/* Conditional rendering based on field type */}
            {config.showSeparateValue ? (
              <>
                {/* Value Input - Only for payment_terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type={config.valueType}
                    name="value"
                    value={formData.value}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.value
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{
                      ...(formErrors.value
                        ? {}
                        : { "--tw-ring-color": "#b36735" }),
                    }}
                    placeholder={config.placeholder}
                    disabled={formLoading}
                  />
                  {formErrors.value && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.value}
                    </p>
                  )}
                </div>

                {/* Display Label Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Label
                  </label>
                  <input
                    type="text"
                    name="displayLabel"
                    value={formData.displayLabel}
                    onChange={handleFormChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFormSubmit();
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.displayLabel
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{
                      ...(formErrors.displayLabel
                        ? {}
                        : { "--tw-ring-color": "#b36735" }),
                    }}
                    placeholder={config.displayPlaceholder}
                    disabled={formLoading}
                  />
                  {formErrors.displayLabel && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.displayLabel}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Single Input - For business_type and supplier_type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fieldType === "business_type"
                      ? "Business Type"
                      : fieldType === "supplier_type"
                      ? "Supplier Type"
                      : "Name"}
                  </label>
                  <input
                    type="text"
                    name="displayLabel"
                    value={formData.displayLabel}
                    onChange={handleFormChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFormSubmit();
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.displayLabel
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{
                      ...(formErrors.displayLabel
                        ? {}
                        : { "--tw-ring-color": "#b36735" }),
                    }}
                    placeholder={config.placeholder}
                    disabled={formLoading}
                  />
                  {formErrors.displayLabel && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.displayLabel}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleFormSubmit}
                className="px-6 py-3 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                style={{ backgroundColor: "#b36735" }}
                onMouseEnter={(e) => {
                  if (!formLoading) e.target.style.backgroundColor = "#a05d30";
                }}
                onMouseLeave={(e) => {
                  if (!formLoading) e.target.style.backgroundColor = "#b36735";
                }}
                disabled={formLoading}
              >
                {formLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {formLoading
                  ? editingField
                    ? "Updating..."
                    : "Adding..."
                  : editingField
                  ? "Update"
                  : "Add"}
              </button>

              {editingField && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formLoading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: "#b36735" }}
                ></div>
                <p className="text-gray-600">
                  Loading custom {fieldType.replace("_", " ")}...
                </p>
              </div>
            ) : customFields.length > 0 ? (
              customFields.map((field) => (
                <div
                  key={field.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    editingField?.id === field.id
                      ? "border-gray-200 hover:bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  style={
                    editingField?.id === field.id
                      ? {
                          borderColor: "#b36735",
                          backgroundColor: "rgba(179, 103, 53, 0.05)",
                        }
                      : {}
                  }
                >
                  <div className="flex items-center flex-1">
                    <div>
                      <span className="font-medium text-gray-900">
                        {field.display_label}
                      </span>
                      {/* Only show config_value for fields with separate value */}
                      {config.showSeparateValue &&
                        field.config_value !== field.display_label && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({field.config_value})
                          </span>
                        )}
                    </div>
                    {editingField?.id === field.id && (
                      <span
                        className="ml-3 px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: "rgba(179, 103, 53, 0.1)",
                          color: "#b36735",
                        }}
                      >
                        Editing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Edit Button */}
                    <button
                      type="button"
                      className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      onClick={() => handleEdit(field)}
                      disabled={deletingField === field.id}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDelete(field)}
                      disabled={
                        deletingField === field.id ||
                        editingField?.id === field.id
                      }
                    >
                      {deletingField === field.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No items found
                </h3>
                <p className="text-sm text-gray-500">
                  Click "Add" to create your first {fieldType.replace("_", " ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-white rounded-b-xl p-4 sticky bottom-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={formLoading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CustomFieldManager;
