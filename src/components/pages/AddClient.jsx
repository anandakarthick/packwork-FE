import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, set } from "react-hook-form";
import FormLayout from "../form/FormLayout";
import CustomerForm from "./CustomerForm";
import { ClientService } from "../../services/ClientServices";
import toast from "react-hot-toast";
import { CommonService } from "../../services/CommonServices";

const AddClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerIdRef = useRef(null);

  const [client, setClient] = useState(null);

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: "",
      customer_reference_number: "",
      customer_type: "client",
      customer_name: "",
      email_id: "",
      mobile_number: "",
      alternative_mobile_number: "",
      business_type_id: "",
      gst: "",
      pan_number: "",
      credit_limit: 0,
      notes: "",
      website: "",
      payment_term_id: "",
      has_gst: false,
      id_active: 1,
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
          country_id: "",
        },
        {
          id: "",
          type: "shipping",
          sequence: 2,
          location_name: "",
          location_code: "",
          contact_person_name: "",
          contact_person_mobile_number: "",
          contact_email: "",
          address: "",
          city_id: "",
          state_id: "",
          pincode: "",
          country_id: "",
        },
      ],
      documents: [],
    },
  });

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

  useEffect(() => {
    const fetchCommonData = async () => {
      try {
        const response = await CommonService.getAllCountries();
        console.log("country data:", response?.data);
        if (response.data?.length === 1) {
          setValue("addresses.0.country_id", response.data[0].id);
          setValue("addresses.1.country_id", response.data[0].id);
          setCountries(response?.data);
          const states = await CommonService.getStatesByCountry(
            response?.data[0].id
          );
          console.log("states data:", states?.data);
          setStates(states?.data);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchConfigData();
    fetchCommonData();
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
    keyName: "formKey",
  });

  const [addressOptions, setAddressOptions] = useState(
    fields.map(() => ({
      states: [],
      cities: [],
    }))
  );

  const hasGst = watch("has_gst");

  const onSubmit = async (data) => {
    console.log("🔥 Form submission started");
    console.log("Form Data:", data);

    clearErrors();

    let hasErrors = false;

    const textPattern = /^[A-Za-z0-9\s]+$/;
    const mobilePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const pincodePattern = /^[1-9][0-9]{5}$/;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstPattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const numberPattern = /^\d+(\.\d{1,2})?$/;
    const websitePattern =
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+([\/?#].*)?$/;

    const validateField = (condition, field, message) => {
      if (condition) {
        setError(field, { type: "manual", message });
        hasErrors = true;
      }
    };
    validateField(
      data.customer_name && !textPattern.test(data.customer_name),
      "customer_name",
      "Customer name can only contain letters and numbers."
    );
    validateField(
      data.email_id && !emailPattern.test(data.email_id),
      "email_id",
      "Enter a valid email address."
    );
    validateField(
      data.mobile_number && !mobilePattern.test(data.mobile_number),
      "mobile_number",
      "Enter a valid 10-digit mobile number."
    );
    validateField(
      data.website && !websitePattern.test(data.website),
      "website",
      "Enter a valid website URL."
    );
    validateField(
      data.alternative_mobile_number &&
        !mobilePattern.test(data.alternative_mobile_number),
      "alternative_mobile_number",
      "Enter a valid 10-digit mobile number."
    );
    validateField(
      data.credit_limit && !numberPattern.test(data.credit_limit),
      "credit_limit",
      "Credit limit must be a valid number."
    );

    validateField(
      data.pan_number && !panPattern.test(data.pan_number),
      "pan_number",
      "Invalid PAN format."
    );

    if (data.has_gst === true || data.has_gst === "true") {
      validateField(
        data.gst_number && !gstPattern.test(data.gst_number),
        "gst_number",
        "Invalid GST number format."
      );
    }
    data.addresses?.forEach((addr, index) => {
      validateField(
        addr.contact_email && !emailPattern.test(addr.contact_email),
        `addresses.${index}.contact_email`,
        "Enter a valid email address."
      );

      validateField(
        addr.contact_person_mobile_number &&
          !mobilePattern.test(addr.contact_person_mobile_number),
        `addresses.${index}.contact_person_mobile_number`,
        "Enter a valid 10-digit phone number."
      );

      validateField(
        addr.pincode && !pincodePattern.test(addr.pincode),
        `addresses.${index}.pincode`,
        "Enter a valid 6-digit pincode."
      );
    });

    console.log("🔍 Validation complete. Has errors:", hasErrors);

    if (hasErrors) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    console.log("✅ Validation passed. Proceeding with API calls...");

    try {
      const customerPayload = {
        customer_name: data.customer_name,
        customer_type: data.customer_type,
        email_id: data.email_id,
        mobile_number: data.mobile_number,
        business_type_id: data.business_type_id,
        pan_number: data.pan_number,
        payment_term_id: data.payment_term_id,
        alternative_mobile_number: data.alternative_mobile_number || null,
        credit_limit: data.credit_limit || 0,
        notes: data.notes || "",
        website: data.website || "",
        gst_number: data.gst_number || "",
        is_active: data.is_active || 1,
      };

      let customerId = data.id || customerIdRef.current || id || null;

      let customerRes;
      if (customerId) {
        customerRes = await ClientService.updateClient(
          customerId,
          customerPayload
        );
        if (!customerRes?.success) {
          const errorMessage =
            customerRes?.message ||
            (customerRes?.data?.message ?? "Failed to update customer");

          if (
            errorMessage.includes("email already exists") ||
            errorMessage.includes("Customer with this email already exists")
          ) {
            toast.error("A customer with this email already exists.");
            return;
          }

          if (
            errorMessage.includes("gst already exists") ||
            errorMessage.includes(
              "Customer with this GST number already exists"
            )
          ) {
            toast.error("A customer with this GST number already exists.");
            return;
          }

          throw new Error(errorMessage);
        }

        console.log("✅ Customer updated:", customerId);
      } else {
        customerRes = await ClientService.createClient(customerPayload);
        if (!customerRes?.success) {
          const errorMessage =
            customerRes?.message ||
            (customerRes?.data?.message ?? "Failed to create customer");

          if (
            errorMessage.includes("email already exists") ||
            errorMessage.includes("Customer with this email already exists")
          ) {
            toast.error("A customer with this email already exists.");
            return;
          }

          if (
            errorMessage.includes("gst already exists") ||
            errorMessage.includes(
              "Customer with this GST number already exists"
            )
          ) {
            toast.error("A customer with this GST number already exists.");
            return;
          }

          throw new Error(errorMessage);
        }

        customerId = customerRes?.data?.id;
        if (!customerId) throw new Error("Customer ID not found in response");
        console.log("✅ Customer created:", customerId);

        customerIdRef.current = customerId;
        setValue("id", customerId);
      }

      // Save addresses
      for (let i = 0; i < (data.addresses || []).length; i++) {
        const original = data.addresses[i];

        const {
          id: _addrId,
          customer_id: _custId,
          company_id,
          created_by,
          updated_by,
          created_at,
          updated_at,
          country_name,
          state_name,
          city_name,
          ...cleanAddress
        } = original;

        if (_addrId) {
          // 🟢 Update existing address
          const updatePayload = { ...cleanAddress };
          const addrRes = await ClientService.updateCustomerAddress(
            _addrId,
            updatePayload
          );

          console.log("✅ Address updated:", addrRes);

          if (!addrRes?.success) {
            toast.error(
              addrRes?.data?.error ||
                "Location name / code already exists for this Client"
            );
            throw new Error(
              addrRes?.data?.message ||
                "Location name / code already exists for this Client"
            );
          }
        } else {
          // 🟢 Create new address
          const createPayload = { ...cleanAddress };
          const addrRes = await ClientService.createCustomerAddress(
            createPayload,
            customerId
          );

          console.log("✅ Address created:", addrRes);

          if (!addrRes?.success) {
            // ✅ Custom toast for duplicate location code or name
            if (
              addrRes?.error?.includes("location code") ||
              addrRes?.error?.includes("location name") ||
              addrRes?.error?.includes("already exists")
            ) {
              toast.error(
                addrRes?.data?.error ||
                  "Location name / code already exists for this Client"
              );
            } else {
              toast.error(
                addrRes?.data?.error ||
                  "Location name / code already exists for this Client"
              );
            }

            throw new Error(
              addrRes?.data?.message || "Failed to create address"
            );
          }
        }
      }

      // Upload documents
      let uploadedDocumentIds = [];

      if (Array.isArray(data.documents) && data.documents.length > 0) {
        for (const doc of data.documents) {
          if (doc.file instanceof File) {
            const formData = new FormData();
            formData.append("document", doc.file);
            formData.append("document_name", doc.name || doc.file.name);

            const uploadRes = await CommonService.uploadDocuments(formData);

            if (!uploadRes?.success) {
              const errorMessage =
                uploadRes?.message ||
                uploadRes?.error ||
                "Failed to upload document";

              if (
                errorMessage.includes("already exists") ||
                errorMessage.includes("Document with name")
              ) {
                toast.error(
                  `Document "${
                    doc.name || doc.file.name
                  }" already exists for this company.`
                );
                continue;
              }

              throw new Error(errorMessage);
            }

            if (uploadRes?.data?.id)
              uploadedDocumentIds.push(uploadRes.data.id);
          }
        }

        if (uploadedDocumentIds.length > 0) {
          for (const docId of uploadedDocumentIds) {
            const linkRes = await ClientService.linkCustomerToDocuments(
              customerId,
              {
                document_id: docId,
                is_active: 1,
              }
            );

            if (!linkRes?.success) {
              const linkError =
                linkRes?.message || linkRes?.error || "Failed to link document";
              toast.error(linkError);
              throw new Error(linkError);
            }
          }
        }
      }

      toast.success(
        customerIdRef.current || id
          ? " Customer updated successfully!"
          : " Customer created successfully!"
      );

      reset();
      setUploadedDocuments([]);

      setTimeout(() => navigate("/clients"), 100);
    } catch (error) {
      console.error("❌ Error submitting customer data:", error);
      toast.error(
        error.message || "Failed to submit customer data. Please try again."
      );
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
      country_id: "",
    });
    setAddressOptions((prev) => [...prev, { states: [], cities: [] }]);
  };

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const response = await ClientService.getClientById(id);
          const clientAddress = await ClientService.getClientAddressById(id);
          console.log("client address", clientAddress?.data);
          const documents = await ClientService.getCustomerAllDocuments(id);

          const formattedDocuments = (documents?.data || []).map((doc) => ({
            id: doc.id,
            name: doc.document_name,
            document_id: doc.document_id,
            file: null,
            originalName: doc.document_name,
            size: Number(doc.document_size),
            type:
              doc.document_type === "pdf"
                ? "application/pdf"
                : `application/${doc.document_type}`,
            uploadedOn: new Date(doc.document_created_at),
            url: doc.document,
            isFromServer: true,
          }));

          setClient({
            ...response?.data,
            addresses: clientAddress?.data || [],
            documents: documents?.data || [],
          });

          setUploadedDocuments(formattedDocuments);

          // ✅ Check if GST number exists and is not empty
          const hasGstValue = Boolean(
            response?.data?.gst_number &&
              response?.data?.gst_number.trim() !== ""
          );

          // ✅ Reset form with fetched values
          reset({
            ...response?.data,
            has_gst: hasGstValue,
            addresses:
              clientAddress?.data?.length > 0
                ? clientAddress?.data
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
                      country_id: "",
                    },
                    {
                      id: "",
                      type: "shipping",
                      sequence: 2,
                      location_name: "",
                      location_code: "",
                      contact_person_name: "",
                      contact_person_mobile_number: "",
                      contact_email: "",
                      address: "",
                      city_id: "",
                      state_id: "",
                      pincode: "",
                      country_id: "",
                    },
                  ],
          });
          setTimeout(() => {
            setValue("has_gst", hasGstValue, {
              shouldDirty: true,
              shouldTouch: true,
            });
          }, 0);
        } catch (error) {
          console.error("Error fetching client:", error);
        }
      };

      fetchClient();
    }
  }, [id, reset]);

  useEffect(() => {
    setValue("documents", uploadedDocuments);
  }, [uploadedDocuments, setValue]);

  return (
    <FormLayout
      title={id ? "Edit Client" : "Add New Client"}
      subtitle={
        id
          ? "Update client details and specifications"
          : "Create a new client record"
      }
      onCancel={() => navigate("/clients")}
      onSubmit={handleSubmit(onSubmit)}
      submitText={id ? "Update Client" : "Create Client"}
    >
      {/* Customer Form Fields */}
      <CustomerForm
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
        customer_type={"client"}
        setError={setError}
        clearErrors={clearErrors}
        uploadedDocuments={uploadedDocuments}
        setUploadedDocuments={setUploadedDocuments}
        getValues={getValues}
        paymentTerms={paymentTerms}
        businessTypes={businessTypes}
        countries={countries}
        states={states}
        cities={cities}
        setCountries={setCountries}
        setStates={setStates}
        setCities={setCities}
        addressOptions={addressOptions}
        setAddressOptions={setAddressOptions}
        id={id}
        reset={fetchConfigData}
      />
    </FormLayout>
  );
};

export default AddClient;
