import React, { useEffect, useState } from "react";
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
          country: "",
        },
      ],
      documents: [],
    },
  });

  useEffect(() => {
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
  });

  const [addressOptions, setAddressOptions] = useState(
    fields.map(() => ({
      states: [],
      cities: [],
    }))
  );

  const hasGst = watch("has_gst");

  const onSubmit = async (data) => {
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

    const validateField = (condition, field, message) => {
      if (condition) {
        setError(field, { type: "manual", message });
        hasErrors = true;
      } else {
        clearErrors(field);
      }
    };

    // validateField(
    //   !data.customer_name?.trim(),
    //   "customer_name",
    //   "Customer name is required."
    // );
    // validateField(
    //   data.customer_name && !textPattern.test(data.customer_name),
    //   "customer_name",
    //   "Customer name can only contain letters and numbers."
    // );
    // validateField(!data.email_id?.trim(), "email_id", "Email ID is required.");
    // validateField(
    //   data.email_id && !emailPattern.test(data.email_id),
    //   "email_id",
    //   "Enter a valid email address."
    // );
    // validateField(
    //   !data.mobile_number?.trim(),
    //   "mobile_number",
    //   "Mobile number is required."
    // );
    // validateField(
    //   data.mobile_number && !mobilePattern.test(data.mobile_number),
    //   "mobile_number",
    //   "Enter a valid 10-digit mobile number."
    // );
    // validateField(
    //   !data.business_type?.trim(),
    //   "business_type",
    //   "Business type is required."
    // );
    // validateField(
    //   !data.payment_terms?.trim(),
    //   "payment_terms",
    //   "Payment terms are required."
    // );
    // validateField(
    //   !data.pan_number?.trim(),
    //   "pan_number",
    //   "PAN number is required."
    // );
    // validateField(
    //   data.pan_number && !panPattern.test(data.pan_number),
    //   "pan_number",
    //   "Invalid PAN format."
    // );

    // if (data.has_gst === true || data.has_gst === "true") {
    //   validateField(
    //     !data.gst_number?.trim(),
    //     "gst_number",
    //     "GST number is required when GST is applicable."
    //   );
    //   validateField(
    //     data.gst_number && !gstPattern.test(data.gst_number),
    //     "gst_number",
    //     "Invalid GST number format."
    //   );
    // }

    // data.addresses.forEach((addr, index) => {
    //   validateField(
    //     !addr.contact_person_name?.trim(),
    //     `addresses.${index}.contact_person_name`,
    //     "Contact person name is required."
    //   );
    //   validateField(
    //     !addr.contact_email?.trim(),
    //     `addresses.${index}.contact_email`,
    //     "Email address is required."
    //   );
    //   validateField(
    //     addr.contact_email && !emailPattern.test(addr.contact_email),
    //     `addresses.${index}.contact_email`,
    //     "Enter a valid email address."
    //   );
    //   validateField(
    //     !addr.contact_person_mobile_number?.trim(),
    //     `addresses.${index}.contact_person_mobile_number`,
    //     "Phone number is required."
    //   );
    //   validateField(
    //     addr.contact_person_mobile_number &&
    //       !mobilePattern.test(addr.contact_person_mobile_number),
    //     `addresses.${index}.contact_person_mobile_number`,
    //     "Enter a valid 10-digit phone number."
    //   );
    //   validateField(
    //     !addr.address?.trim(),
    //     `addresses.${index}.address`,
    //     "Address is required."
    //   );
    //   validateField(
    //     !addr.city_id,
    //     `addresses.${index}.city_id`,
    //     "City is required."
    //   );
    //   validateField(
    //     !addr.state_id,
    //     `addresses.${index}.state_id`,
    //     "State is required."
    //   );
    //   validateField(
    //     !addr.country,
    //     `addresses.${index}.country`,
    //     "Country is required."
    //   );
    //   validateField(
    //     !addr.pincode?.trim(),
    //     `addresses.${index}.pincode`,
    //     "Pincode is required."
    //   );
    //   validateField(
    //     addr.pincode && !pincodePattern.test(addr.pincode),
    //     `addresses.${index}.pincode`,
    //     "Enter a valid 6-digit pincode."
    //   );
    // });

    if (hasErrors) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    clearErrors();

    try {
      const customerPayload = {
        customer_name: data.customer_name,
        customer_type: data.customer_type,
        email_id: data.email_id,
        mobile_number: data.mobile_number,
        business_type_id: data.business_type,
        pan_number: data.pan_number,
        payment_term_id: data.payment_terms,
        alternative_mobile_number: data.alternative_mobile_number || null,
        credit_limit: data.credit_limit || 0,
        notes: data.notes || "",
        website: data.website || "",
        gst_number: data.gst_number || "",
      };

      // 🔹 Step 1: Create customer
      const customerRes = await ClientService.createClient(customerPayload);
      console.log("Customer response:", customerRes);

      if (!customerRes?.success) {
        throw new Error(customerRes?.message || "Failed to create customer");
      }

      const customerId = customerRes?.data?.id;
      if (!customerId) {
        throw new Error("Customer ID not found in response");
      }

      console.log("✅ Customer created:", customerId);

      // 🔹 Step 2: Create customer addresses
      const addressPayloads = data.addresses.map((addr) => ({
        customer_id: customerId,
        type: addr.type,
        contact_person_name: addr.contact_person_name,
        contact_email: addr.contact_email,
        contact_person_mobile_number: addr.contact_person_mobile_number,
        address: addr.address,
        city_id: addr.city,
        state_id: addr.state,
        country_id: addr.country,
        pincode: addr.pincode,
      }));

      for (const payload of addressPayloads) {
        const addrRes = await ClientService.createCustomerAddress(
          payload,
          customerId
        );
        if (!addrRes?.success) {
          throw new Error(
            addrRes?.message || "Failed to create customer address"
          );
        }
      }

      // 🔹 Step 3: Upload documents (if any)
      let uploadedDocumentIds = [];
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          const formData = new FormData();
          formData.append("document", doc.file);
          formData.append("document_name", doc.name || doc.file.name);

          const uploadRes = await CommonService.uploadDocuments(formData);
          console.log("Document uploaded:", uploadRes?.data);

          if (!uploadRes?.success) {
            throw new Error(uploadRes?.message || "Failed to upload document");
          }

          if (uploadRes?.data?.id) {
            uploadedDocumentIds.push(uploadRes.data.id);
          }
        }
      }

      console.log("✅ Documents uploaded:", uploadedDocumentIds);

      // 🔹 Step 4: Link documents
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
            throw new Error(
              linkRes?.message || "Failed to link document to customer"
            );
          }
        }
      }

      // ✅ Final success
      toast.success("✅ Customer and documents saved successfully!");
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
      country: "",
    });
    setAddressOptions((prev) => [...prev, { states: [], cities: [] }]);
  };

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const response = await ClientService.getClientById(id);
          setClient(response);

          // ✅ Set form values for editing
          reset({
            ...response,
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
                      country: "",
                    },
                  ],
          });
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
      />
    </FormLayout>
  );
};

export default AddClient;
