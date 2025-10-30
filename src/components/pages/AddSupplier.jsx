import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import FormLayout from "../form/FormLayout";
import SupplierForm from "./SupplierForm";
import { ClientService } from "../../services/ClientServices";
import toast from "react-hot-toast";
import { CommonService } from "../../services/CommonServices";

const AddSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const customerIdRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: "",
      customer_reference_number: "",
      customer_type: "vendor",
      customer_name: "",
      email_id: "",
      mobile_number: "",
      alternative_mobile_number: "",
      business_type_id: "",
      gst_number: "",
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
          country_id: "",
        },
      ],
      documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
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
      "Supplier name can only contain letters and numbers."
    );
    validateField(
      data.email_id && !emailPattern.test(data.email_id),
      "email_id",
      "Enter a valid email address."
    );
    validateField(
      data.website && !websitePattern.test(data.website),
      "website",
      "Enter a valid website URL."
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
            (customerRes?.data?.message ?? "Failed to update supplier");

          if (
            errorMessage.includes("email already exists") ||
            errorMessage.includes("Customer with this email already exists")
          ) {
            toast.error("A supplier with this email already exists.");
            return;
          }

          if (
            errorMessage.includes("gst already exists") ||
            errorMessage.includes(
              "Customer with this GST number already exists"
            )
          ) {
            toast.error("A supplier with this GST number already exists.");
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
            (customerRes?.data?.message ?? "Failed to create supplier");

          // Show specific duplicate validation messages for clarity
          if (
            errorMessage.includes("email already exists") ||
            errorMessage.includes("Customer with this email already exists")
          ) {
            toast.error("A supplier with this email already exists.");
            return;
          }

          if (
            errorMessage.includes("gst already exists") ||
            errorMessage.includes(
              "Customer with this GST number already exists"
            )
          ) {
            toast.error("A supplier with this GST number already exists.");
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
          const updatePayload = { ...cleanAddress };
          const addrRes = await ClientService.updateCustomerAddress(
            _addrId,
            updatePayload
          );
          if (!addrRes?.success) {
            throw new Error(addrRes?.message || "Failed to update address");
          }
        } else {
          const createPayload = { ...cleanAddress };
          const addrRes = await ClientService.createCustomerAddress(
            createPayload,
            customerId
          );
          if (!addrRes?.success) {
            throw new Error(addrRes?.message || "Failed to create address");
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
          ? " Supplier updated successfully!"
          : " Supplier created successfully!"
      );

      reset();
      setUploadedDocuments([]);

      setTimeout(() => navigate("/suppliers"), 100);
    } catch (error) {
      console.error("❌ Error submitting supplier data:", error);
      toast.error(
        error.message || "Failed to submit supplier data. Please try again."
      );
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchSupplier = async () => {
      try {
        const [clientRes, addressRes, documentsRes] = await Promise.all([
          ClientService.getClientById(id),
          ClientService.getClientAddressById(id),
          ClientService.getCustomerAllDocuments(id),
        ]);

        const address = addressRes?.data?.[0] || {};

        const countryId = address?.country_id;
        const stateId = address?.state_id;
        const cityId = address?.city_id;

        // Fetch country list first
        const countryRes = await CommonService.getAllCountries();
        setCountries(countryRes?.data || []);

        // --- Load state list if countryId exists ---
        let fetchedStates = [];
        if (countryId) {
          const stateRes = await CommonService.getStatesByCountry(countryId);
          if (stateRes?.success) {
            fetchedStates = stateRes.data || [];
            setStates(fetchedStates);
          }
        }

        // --- Load city list if stateId exists ---
        let fetchedCities = [];
        if (stateId) {
          const cityRes = await CommonService.getCitiesByState(stateId);
          if (cityRes?.success) {
            fetchedCities = cityRes.data || [];
            setCities(fetchedCities);
          }
        }
        const hasGstValue = Boolean(
          clientRes?.data?.gst_number &&
            clientRes?.data?.gst_number.trim() !== ""
        );

        // ✅ Now safely reset form with loaded dropdowns
        reset({
          ...clientRes?.data,
          has_gst: hasGstValue,
          addresses: [
            {
              id: address.id || "",
              type: address.type || "billing",
              sequence: 1,
              location_name: address.location_name || "",
              location_code: address.location_code || "",
              contact_person_name: address.contact_person_name || "",
              contact_person_mobile_number:
                address.contact_person_mobile_number || "",
              contact_email: address.contact_email || "",
              address: address.address || "",
              city_id: cityId || "",
              state_id: stateId || "",
              pincode: address.pincode || "",
              country_id: countryId || "",
            },
          ],
        });

        setTimeout(() => {
          if (cityId) setValue("addresses.0.city_id", cityId);
        }, 150);
        setTimeout(() => {
          setValue("has_gst", hasGstValue, {
            shouldDirty: true,
            shouldTouch: true,
          });
        }, 0);

        const formattedDocuments = (documentsRes?.data || []).map((doc) => ({
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

        setUploadedDocuments(formattedDocuments);

        setSupplier({
          ...clientRes?.data,
          addresses: addressRes?.data || [],
          documents: documentsRes?.data || [],
        });
      } catch (error) {
        console.error("❌ Error fetching supplier:", error);
      }
    };

    fetchSupplier();
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
        watch={watch}
        hasGst={hasGst}
        setValue={setValue}
        customer_type={"supplier"}
        uploadedDocuments={uploadedDocuments}
        setUploadedDocuments={setUploadedDocuments}
        setError={setError}
        clearErrors={clearErrors}
        paymentTerms={paymentTerms}
        businessTypes={businessTypes}
        countries={countries}
        states={states}
        cities={cities}
        setCountries={setCountries}
        setStates={setStates}
        setCities={setCities}
        getValues={getValues}
        id={id}
        reset={fetchConfigData}
      />
    </FormLayout>
  );
};

export default AddSupplier;
