import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import FormLayout from "../form/FormLayout";
import SupplierForm from "./SupplierForm";
import { ClientService } from "../../services/ClientServices";
import toast from "react-hot-toast";

const AddSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: "",
      customer_reference_number: "",
      customer_type: "supplier",
      customer_name: "",
      email_id: "",
      mobile_number: "",
      alternative_mobile_number: "",
      business_type: "",
      gst: "",
      pan_number: "",
      credit_limit: 0,
      notes: "",
      website: "",
      payment_term_id: "",
      has_gst: false,
      addresses: [
        {
          id: "",
          type: "billing",
          sequence: 1,
          location_name: "",
          location_code: "",
          contact_person_name: "",
          contact_person_mobile_number: "",
          contact_email: "",
          address: "",
          city_id: "",
          state_id: "",
          pincode: "",
          country: "",
        },
      ],
      documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const hasGst = watch("has_gst");

  const onSubmit = (data) => {
    let hasErrors = false;

    // --- Validation patterns ---
    const textPattern = /^[A-Za-z0-9\s]+$/;
    const mobilePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const pincodePattern = /^[1-9][0-9]{5}$/;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstPattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    // Helper function
    const validateField = (condition, field, message) => {
      if (condition) {
        setError(field, { type: "manual", message });
        hasErrors = true;
      } else {
        clearErrors(field);
      }
    };

    // --- Field validations ---
    validateField(
      !data.customer_name?.trim(),
      "customer_name",
      "Customer name is required."
    );
    validateField(
      data.customer_name && !textPattern.test(data.customer_name),
      "customer_name",
      "Customer name can only contain letters and numbers."
    );

    validateField(!data.email_id?.trim(), "email_id", "Email ID is required.");
    validateField(
      data.email_id && !emailPattern.test(data.email_id),
      "email_id",
      "Enter a valid email address."
    );

    validateField(
      !data.mobile_number?.trim(),
      "mobile_number",
      "Mobile number is required."
    );
    validateField(
      data.mobile_number && !mobilePattern.test(data.mobile_number),
      "mobile_number",
      "Enter a valid 10-digit mobile number."
    );

    validateField(
      data.alternative_mobile_number &&
        !mobilePattern.test(data.alternative_mobile_number),
      "alternative_mobile_number",
      "Enter a valid 10-digit mobile number."
    );

    validateField(
      data.credit_limit && data.credit_limit < 0,
      "credit_limit",
      "Credit limit must be a positive number."
    );

    validateField(
      !data.business_type?.trim(),
      "business_type",
      "Business type is required."
    );

    validateField(
      !data.payment_terms?.trim(),
      "payment_terms",
      "Payment terms are required."
    );

    validateField(
      !data.pan_number?.trim(),
      "pan_number",
      "PAN number is required."
    );
    validateField(
      data.pan_number && !panPattern.test(data.pan_number),
      "pan_number",
      "Invalid PAN format. Use: ABCDE1234F"
    );

    if (data.has_gst === true || data.has_gst === "true") {
      validateField(
        !data.gst_number?.trim(),
        "gst_number",
        "GST number is required when GST is applicable."
      );
      validateField(
        data.gst_number && !gstPattern.test(data.gst_number),
        "gst_number",
        "Invalid GST number format."
      );
    }

    // --- Address loop ---
    data.addresses.forEach((addr, index) => {
      validateField(
        !addr.contact_person_name?.trim(),
        `addresses.${index}.contact_person_name`,
        "Contact person name is required."
      );
      validateField(
        !addr.phone?.trim(),
        `addresses.${index}.phone`,
        "Phone number is required."
      );
      validateField(
        addr.phone && !mobilePattern.test(addr.phone),
        `addresses.${index}.phone`,
        "Enter a valid 10-digit phone number."
      );
      validateField(
        !addr.email?.trim(),
        `addresses.${index}.email`,
        "Email address is required."
      );
      validateField(
        addr.email && !emailPattern.test(addr.email),
        `addresses.${index}.email`,
        "Enter a valid email address."
      );
      validateField(
        !addr.address?.trim(),
        `addresses.${index}.address`,
        "Address is required."
      );
      validateField(
        !addr.city?.trim(),
        `addresses.${index}.city`,
        "City is required."
      );
      validateField(
        !addr.state?.trim(),
        `addresses.${index}.state`,
        "State is required."
      );
      validateField(
        !addr.country,
        `addresses.${index}.country`,
        "Country is required."
      );
      validateField(
        !addr.pincode?.trim(),
        `addresses.${index}.pincode`,
        "Pincode is required."
      );
      validateField(
        addr.pincode && !pincodePattern.test(addr.pincode),
        `addresses.${index}.pincode`,
        "Enter a valid 6-digit pincode."
      );

      if (index > 0) {
        validateField(
          !addr.location_name?.trim(),
          `addresses.${index}.location_name`,
          "Location name is required."
        );
        validateField(
          !addr.location_code?.trim(),
          `addresses.${index}.location_code`,
          "Location code is required."
        );
      }
    });

    // --- Stop if validation failed ---
    if (hasErrors) {
      console.log("❌ Validation failed — please fix the errors.");
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    // ✅ Create FormData for submission
    const formData = new FormData();

    // --- Add basic fields ---
    formData.append("customer_name", data.customer_name);
    formData.append("email_id", data.email_id);
    formData.append("mobile_number", data.mobile_number);
    formData.append("business_type", data.business_type);
    formData.append("pan_number", data.pan_number);
    formData.append("payment_terms", data.payment_terms);
    formData.append("has_gst", data.has_gst);
    formData.append("status", data.status || "Active");

    // Optional fields
    if (data.alternative_mobile_number) {
      formData.append(
        "alternative_mobile_number",
        data.alternative_mobile_number
      );
    }
    if (data.credit_limit) {
      formData.append("credit_limit", data.credit_limit);
    }
    if (data.notes) {
      formData.append("notes", data.notes);
    }
    if (data.website) {
      formData.append("website", data.website);
    }
    if (data.gst_number) {
      formData.append("gst_number", data.gst_number);
    }
    if (data.customer_reference_number) {
      formData.append(
        "customer_reference_number",
        data.customer_reference_number
      );
    }

    // --- Add addresses as JSON string ---
    formData.append("addresses", JSON.stringify(data.addresses));

    // --- Add documents (actual files) ---
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc, index) => {
        // Append the actual file
        formData.append(`documents`, doc.file);

        // Append metadata for each document
        formData.append(`document_names[${index}]`, doc.name);
        formData.append(`document_original_names[${index}]`, doc.originalName);
      });
    }

    // --- Log FormData contents (for debugging) ---
    console.log("✅ Form validated successfully!");
    console.log("📦 FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // --- API call ---
    submitCustomerData(formData);
  };

  // ✅ API submission function
  const submitCustomerData = async (formData) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      if (!response.ok) {
        throw new Error("Failed to submit customer data");
      }

      const result = await response.json();
      console.log("✅ Customer created successfully:", result);
      toast.success("Customer created successfully!");

      // Reset form if needed
      // reset();
      // setUploadedDocuments([]);
    } catch (error) {
      console.error("❌ Error submitting customer data:", error);
      toast.error("Failed to create customer. Please try again.");
    }
  };

  const handleAddAddress = () => {
    append({
      id: "",
      type: "shipping",
      sequence: fields.length + 1,
      location_name: "",
      location_code: "",
      contact_person_name: "",
      contact_person_mobile_number: "",
      contact_email: "",
      address: "",
      city_id: "",
      state_id: "",
      pincode: "",
      country: "",
    });
  };

  useEffect(() => {
    if (id) {
      const fetchSupplier = async () => {
        try {
          const response = await ClientService.getClientById(id);
          setSupplier(response);

          // ✅ Populate form with fetched supplier data
          reset({
            ...response,
            customer_type: "supplier", // ensure type consistency
            addresses:
              response.addresses && response.addresses.length > 0
                ? response.addresses
                : [
                    {
                      id: "",
                      type: "billing",
                      sequence: 1,
                      location_name: "",
                      location_code: "",
                      contact_person_name: "",
                      contact_person_mobile_number: "",
                      contact_email: "",
                      address: "",
                      city_id: "",
                      state_id: "",
                      pincode: "",
                      country: "",
                    },
                  ],
          });
        } catch (error) {
          console.error("Error fetching supplier:", error);
        }
      };
      fetchSupplier();
    }
  }, [id, reset]);
  useEffect(() => {
    setValue("documents", uploadedDocuments);
  }, [uploadedDocuments, setValue]);

  return (
    <FormLayout
      title={id ? "Edit Supplier" : "Add New Supplier"}
      subtitle={
        id
          ? "Update supplier details and specifications"
          : "Create a new supplier record"
      }
      onCancel={() => navigate("/suppliers")}
      onSubmit={handleSubmit(onSubmit)}
      submitText={id ? "Update Supplier" : "Create Supplier"}
    >
      {/* Supplier Form Fields */}
      <SupplierForm
        register={register}
        control={control}
        errors={errors}
        fields={fields}
        append={append}
        remove={remove}
        handleAddAddress={handleAddAddress}
        watch={watch}
        hasGst={hasGst}
        setValue={setValue}
        customer_type={"supplier"}
        uploadedDocuments={uploadedDocuments}
        setUploadedDocuments={setUploadedDocuments}
        setError={setError}
        clearErrors={clearErrors}
      />
    </FormLayout>
  );
};

export default AddSupplier;
