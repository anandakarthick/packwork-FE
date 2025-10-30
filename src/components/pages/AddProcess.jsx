import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormLayout from "../form/FormLayout";
import { useFieldArray, useForm } from "react-hook-form";
import {
  AlertCircle,
  Hash,
  InfoIcon,
  Plus,
  SettingsIcon,
  Trash2,
  X,
} from "lucide-react";
import ProcessService from "../../services/ProcessServices";
import toast from "react-hot-toast";

const AddProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const processIdRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: "",
      process_number: "",
      process_name: "",
      process_custom_fields: [
        {
          id: "",
          field_label: "",
          field_type: "text",
          default_value: "",
          dropdown_options: [],
          is_required: 0,
          field_order: 1,
        },
      ],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "process_custom_fields",
  });

  const onSubmit = async (data) => {
    console.log("Process Data Submitted:", data);

    try {
      let processId = data.id || processIdRef.current || null;
      const { process_custom_fields, id, process_number, ...processPayload } =
        data;

      const textPattern = /^[A-Za-z0-9\s_-]+$/;

      if (!textPattern.test(processPayload.process_name)) {
        toast.error("Process name cannot contain special characters.");
        throw new Error("Process name cannot contain special characters.");
      }

      const seenOrders = new Set();
      const seenLabelTypeCombo = new Set();

      for (const field of process_custom_fields) {
        const { field_label, field_type, field_order, default_value } = field;

        if (!textPattern.test(field_label)) {
          toast.error(
            `Field label "${field_label}" contains special characters.`
          );
          throw new Error(
            `Field label "${field_label}" contains special characters.`
          );
        }

        if (seenOrders.has(field_order)) {
          toast.error(
            `Duplicate field order found: ${field_order}. Each field must have a unique order.`
          );
          throw new Error(
            `Duplicate field order found: ${field_order}. Each field must have a unique order.`
          );
        }
        seenOrders.add(field_order);

        const comboKey = `${field_label.toLowerCase()}_${field_type.toLowerCase()}`;
        if (seenLabelTypeCombo.has(comboKey)) {
          toast.error(
            `Duplicate combination found: "${field_label}" with type "${field_type}".`
          );
          throw new Error(
            `Duplicate combination found: "${field_label}" with type "${field_type}".`
          );
        }
        seenLabelTypeCombo.add(comboKey);

        if (
          default_value !== undefined &&
          default_value !== null &&
          default_value !== ""
        ) {
          switch (field_type.toLowerCase()) {
            case "number":
              if (isNaN(default_value)) {
                toast.error(
                  `Default value for "${field_label}" must be a number.`
                );
                throw new Error(
                  `Default value for "${field_label}" must be a number.`
                );
              }
              break;

            case "checkbox":
              if (
                !["true", "false", true, false, 1, 0, "1", "0"].includes(
                  default_value
                )
              ) {
                toast.error(
                  `Default value for "${field_label}" must be true or false.`
                );
                throw new Error(
                  `Default value for "${field_label}" must be true or false.`
                );
              }
              break;

            case "dropdown":
              if (!field.dropdown_options?.includes(default_value)) {
                toast.error(
                  `Default value for "${field_label}" must be one of the dropdown options.`
                );
                throw new Error(
                  `Default value for "${field_label}" must be one of the dropdown options.`
                );
              }
              break;

            default:
              if (typeof default_value !== "string") {
                toast.error(`Default value for "${field_label}" must be text.`);
                throw new Error(
                  `Default value for "${field_label}" must be text.`
                );
              }
          }
        }
      }

      if (processId) {
        const updateRes = await ProcessService.updateProcess(
          processId,
          processPayload
        );
        if (!updateRes?.success) {
          toast.error(updateRes?.message || "Failed to update process");
          throw new Error(updateRes?.message || "Failed to update process");
        }
        console.log("✅ Process updated:", processId);
      } else {
        const createRes = await ProcessService.createProcess(processPayload);
        if (!createRes?.success) {
          throw new Error(createRes?.message || "Failed to create process");
        }

        processId = createRes?.data?.id;
        if (!processId) throw new Error("Process ID not found in response");

        processIdRef.current = processId;
        setValue("id", processId);
        console.log("✅ Process created:", processId);
      }

      for (let i = 0; i < process_custom_fields.length; i++) {
        const field = process_custom_fields[i];
        const { id: fieldId, process_id, ...cleanField } = field;

        cleanField.is_required =
          cleanField.is_required === true ||
          cleanField.is_required === 1 ||
          cleanField.is_required === "1"
            ? 1
            : 0;

        let fieldPayload;
        if (
          cleanField.field_type?.toLowerCase() === "dropdown" &&
          Array.isArray(cleanField.dropdown_options)
        ) {
          fieldPayload = { ...cleanField };
        } else {
          const { dropdown_options, ...rest } = cleanField;
          fieldPayload = { ...rest };
        }

        let fieldRes;
        try {
          if (fieldId) {
            fieldRes = await ProcessService.updateProcessCustomField(
              fieldId,
              fieldPayload
            );
          } else {
            fieldRes = await ProcessService.createProcessCustomFields(
              processId,
              fieldPayload
            );
          }

          if (!fieldRes?.success) {
            let errorMsg = fieldRes?.message || "Failed to save custom field";

            if (
              fieldRes?.error?.includes("Duplicate entry") ||
              fieldRes?.message?.includes("Duplicate entry")
            ) {
              errorMsg = `Duplicate field: "${cleanField.field_label}" already exists in this process.`;
            }

            toast.error(errorMsg);
            throw new Error(errorMsg);
          }

          if (!fieldId && fieldRes?.data?.id) {
            process_custom_fields[i].id = fieldRes.data.id;
          }
        } catch (err) {
          console.error("❌ Error saving field:", cleanField, err);
          const errorMsg = `Error saving field "${cleanField.field_label}"`;
          toast.error(errorMsg);
          throw err;
        }
      }

      toast.success(
        processIdRef.current || id
          ? "Process updated successfully!"
          : "Process and custom fields created successfully!"
      );

      reset();
      navigate("/process");
    } catch (error) {
      console.error("❌ Error submitting process data:", error);
      toast.error(
        error.message || "Something went wrong while saving process."
      );
    }
  };

  const [newOptions, setNewOptions] = useState({});

  // Add option to dropdown_options array
  const handleAddOption = (index) => {
    const optionValue = newOptions[index]?.trim();
    if (!optionValue) return;

    const currentFields = getValues("process_custom_fields");
    const field = currentFields[index];

    const updatedOptions = [...(field.dropdown_options || []), optionValue];
    setValue(`process_custom_fields.${index}.dropdown_options`, updatedOptions);

    // Clear input for that index
    setNewOptions((prev) => ({ ...prev, [index]: "" }));
  };

  // Remove a specific dropdown option
  const handleRemoveOption = (index, optionIndex) => {
    const currentFields = getValues("process_custom_fields");
    const field = currentFields[index];
    const updatedOptions = field.dropdown_options.filter(
      (_, i) => i !== optionIndex
    );
    setValue(`process_custom_fields.${index}.dropdown_options`, updatedOptions);
  };

  useEffect(() => {
    if (id) {
      const fetchProcess = async () => {
        try {
          // ✅ Fetch process details
          const processRes = await ProcessService.getProcessById(id);
          const processData = processRes?.data;

          // ✅ Fetch related custom fields
          const customFieldsRes = await ProcessService.getProcessCustomFields(
            id
          );
          const processCustomFieldsData = Array.isArray(customFieldsRes?.data)
            ? customFieldsRes.data
            : [];

          if (processData) {
            const formattedFields =
              processCustomFieldsData.length > 0
                ? processCustomFieldsData.map((field, index) => {
                    // Parse dropdown options
                    const dropdownOptions = Array.isArray(
                      field.dropdown_options
                    )
                      ? field.dropdown_options
                      : typeof field.dropdown_options === "string"
                      ? field.dropdown_options
                          .split(",")
                          .map((opt) => opt.trim())
                      : [];

                    // Normalize field_type to lowercase to match select options
                    const normalizedFieldType = field.field_type 
                      ? field.field_type.toLowerCase() 
                      : "text";

                    // Normalize default_value based on field_type
                    let defaultValue = field.default_value ?? "";

                    if (normalizedFieldType === "checkbox") {
                      // Convert checkbox values to string "true" or "false"
                      if (
                        defaultValue === true ||
                        defaultValue === 1 ||
                        defaultValue === "1" ||
                        defaultValue === "true"
                      ) {
                        defaultValue = "true";
                      } else if (
                        defaultValue === false ||
                        defaultValue === 0 ||
                        defaultValue === "0" ||
                        defaultValue === "false"
                      ) {
                        defaultValue = "false";
                      }
                    } else if (normalizedFieldType === "dropdown") {
                      // Ensure default_value is a string and trim it
                      defaultValue = defaultValue ? String(defaultValue).trim() : "";
                      
                      // Verify the default value exists in dropdown options
                      if (defaultValue && !dropdownOptions.includes(defaultValue)) {
                        console.warn(
                          `Default value "${defaultValue}" not found in dropdown options for field "${field.field_label}". Available options:`,
                          dropdownOptions
                        );
                        defaultValue = "";
                      }
                    } else if (normalizedFieldType === "number") {
                      // Keep numbers as strings for input compatibility
                      defaultValue = defaultValue ? String(defaultValue) : "";
                    } else {
                      // For text and other types
                      defaultValue = defaultValue ? String(defaultValue) : "";
                    }

                    return {
                      id: field.id || "",
                      field_label: field.field_label || "",
                      field_type: normalizedFieldType,
                      default_value: defaultValue,
                      dropdown_options: dropdownOptions,
                      is_required:
                        field.is_required === true ||
                        field.is_required === 1 ||
                        field.is_required === "1"
                          ? 1
                          : 0,
                      field_order: field.field_order || index + 1,
                    };
                  })
                : [
                    {
                      id: "",
                      field_label: "",
                      field_type: "text",
                      default_value: "",
                      dropdown_options: [],
                      is_required: 0,
                      field_order: 1,
                    },
                  ];

            console.log("Formatted fields for form:", formattedFields);

            reset({
              id: processData.id || "",
              process_number: processData.process_number || "",
              process_name: processData.process_name || "",
              process_custom_fields: formattedFields,
            });
          }
        } catch (error) {
          console.error("❌ Error fetching process data:", error);
        }
      };

      fetchProcess();
    }
  }, [id, reset]);
  
  const fieldTypes = watch("process_custom_fields");
  const [initialFieldTypes, setInitialFieldTypes] = useState({});

  // Reset default values when field type changes
  useEffect(() => {
    if (fieldTypes && Array.isArray(fieldTypes)) {
      fieldTypes.forEach((field, index) => {
        const currentType = field?.field_type;
        const previousType = initialFieldTypes[index];

        // Only reset if the field type actually changed (not on initial load)
        if (previousType !== undefined && previousType !== currentType) {
          setValue(`process_custom_fields.${index}.default_value`, "");
        }

        // Update the tracked field type
        setInitialFieldTypes((prev) => ({ ...prev, [index]: currentType }));
      });
    }
  }, [JSON.stringify(fieldTypes?.map((f) => f?.field_type))]);

  return (
    <div>
      <FormLayout
        title={id ? "Edit Process" : "Add New Process"}
        subtitle={
          id
            ? "Update process details and specifications"
            : "Create a new process record"
        }
        onCancel={() => navigate("/process")}
        onSubmit={handleSubmit(onSubmit)}
        submitText={id ? "Update Process" : "Create Process"}
      >
        <div className="card-corrugated p-4 space-y-3">
          <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
            <div className="bg-primary-100 rounded-full p-1 mr-2">
              <InfoIcon className="h-3 w-3 text-primary-600" />
            </div>
            Process Information
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Process Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("process_name", {
                  required: "Process name is required",
                })}
                className={`w-1/2 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                  errors.process_name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter process name"
              />
              {errors.process_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.process_name.message}
                </p>
              )}
            </div>

            <div className="w-full bg-primary-50 border border-primary-200 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary-600" />
                <div>
                  <h4 className="text-xs font-medium text-primary-800">
                    Process ID
                  </h4>
                  <p className="text-xs text-primary-600">Auto-generated</p>
                </div>
              </div>

              <div className="text-base font-semibold text-primary-700 font-mono">
                {id ? watch("process_number") || "N/A" : "Will be generated"}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- CUSTOM FIELDS SECTION ---------- */}
        <div className="card-corrugated p-4 space-y-3 mt-3">
          <h3 className="text-base font-medium text-manufacturing-800 mb-6 pb-3 border-b border-manufacturing-200 flex items-center justify-between">
            <span className="flex items-center">
              <div className="bg-purple-100 rounded-full p-1 mr-2">
                <SettingsIcon className="h-4 w-4" />
              </div>
              Custom Fields
            </span>

            <button
              type="button"
              onClick={() =>
                append({
                  field_label: "",
                  field_type: "text",
                  field_order: fields.length + 1,
                  is_required: 0,
                  dropdown_options: [],
                  default_value: "",
                })
              }
              className="px-4 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Field
            </button>
          </h3>

          {fields.map((item, index) => {
            const fieldType = watch(
              `process_custom_fields.${index}.field_type`
            );
            const dropdownOptions = watch(
              `process_custom_fields.${index}.dropdown_options`
            );

            return (
              <div
                key={item.id || index}
                className="border-b border-gray-200 pb-4 mb-4 space-y-3"
              >
                {/* MAIN FIELD ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                  {/* FIELD LABEL */}
                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Field Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(
                        `process_custom_fields.${index}.field_label`,
                        {
                          required: "Field label is required",
                        }
                      )}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                        errors?.process_custom_fields?.[index]?.field_label
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Enter field label"
                    />
                    {errors?.process_custom_fields?.[index]?.field_label && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {
                          errors.process_custom_fields[index].field_label
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* FIELD TYPE */}
                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Field Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(
                        `process_custom_fields.${index}.field_type`,
                        {
                          required: "Field type is required",
                        }
                      )}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                        errors?.process_custom_fields?.[index]?.field_type
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <option value="">Select type</option>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                    {errors?.process_custom_fields?.[index]?.field_type && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.process_custom_fields[index].field_type.message}
                      </p>
                    )}
                  </div>

                  {/* FIELD ORDER */}
                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Field Order <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register(
                        `process_custom_fields.${index}.field_order`,
                        {
                          required: "Order is required",
                        }
                      )}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                        errors?.process_custom_fields?.[index]?.field_order
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Order"
                    />
                    {errors?.process_custom_fields?.[index]?.field_order && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {
                          errors.process_custom_fields[index].field_order
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* ✅ DEFAULT VALUE FIELD */}
                  {fieldType === "checkbox" ? (
                    <div>
                      <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                        Default Value <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(
                          `process_custom_fields.${index}.default_value`,
                          {
                            required: "Default value is required",
                          }
                        )}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors?.process_custom_fields?.[index]?.default_value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <option value="">Select default value</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                      {errors?.process_custom_fields?.[index]
                        ?.default_value && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.process_custom_fields[index].default_value
                              .message
                          }
                        </p>
                      )}
                    </div>
                  ) : fieldType === "dropdown" ? (
                    <div>
                      <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                        Default Value <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(
                          `process_custom_fields.${index}.default_value`,
                          {
                            required: "Default value is required",
                          }
                        )}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors?.process_custom_fields?.[index]?.default_value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <option value="">Select default value</option>
                        {dropdownOptions?.length > 0 ? (
                          dropdownOptions.map((opt, optIndex) => (
                            <option key={optIndex} value={opt}>
                              {opt}
                            </option>
                          ))
                        ) : (
                          <option disabled>No options available</option>
                        )}
                      </select>
                      {errors?.process_custom_fields?.[index]
                        ?.default_value && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.process_custom_fields[index].default_value
                              .message
                          }
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                        Default Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register(
                          `process_custom_fields.${index}.default_value`,
                          {
                            required: "Default value is required",
                          }
                        )}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors ${
                          errors?.process_custom_fields?.[index]?.default_value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter default value"
                      />
                      {errors?.process_custom_fields?.[index]
                        ?.default_value && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {
                            errors.process_custom_fields[index].default_value
                              .message
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {/* REQUIRED CHECKBOX */}
                  <label className="flex align-items-center md:justify-center">
                    <input
                      type="checkbox"
                      {...register(
                        `process_custom_fields.${index}.is_required`
                      )}
                      className="mr-2"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Required
                    </span>
                  </label>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>

                {/* SHOW DROPDOWN OPTIONS SECTION */}
                {fieldType === "dropdown" && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Add Options to the dropdown field
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newOptions[index] || ""}
                        onChange={(e) =>
                          setNewOptions((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        placeholder="Enter option value"
                        className="w-1/4 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOption(index)}
                        className="p-2 bg-corrugated-600 text-white rounded-lg hover:bg-corrugated-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Added options */}
                    {dropdownOptions?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Added Options:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dropdownOptions.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs"
                            >
                              {opt}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOption(index, optIndex)
                                }
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FormLayout>
    </div>
  );
};

export default AddProcess;