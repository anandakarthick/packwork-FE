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
    console.log("Form Data:", data);
    clearErrors();
    let hasErrors = false;

    const validateField = (condition, field, message) => {
      if (condition) {
        setError(field, { type: "manual", message });
        hasErrors = true;
      } else {
        clearErrors(field);
      }
    };

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
        business_type_id: data.business_type_id,
        pan_number: data.pan_number,
        payment_term_id: data.payment_term_id,
        alternative_mobile_number: data.alternative_mobile_number || null,
        credit_limit: data.credit_limit || 0,
        notes: data.notes || "",
        website: data.website || "",
        gst_number: data.gst_number || "",
      };

      let customerId = data.id || customerIdRef.current || id || null;

      let customerRes;
      if (customerId) {
        customerRes = await ClientService.updateClient(
          customerId,
          customerPayload
        );
        if (!customerRes?.success) {
          throw new Error(customerRes?.message || "Failed to update customer");
        }
        console.log("✅ Customer updated:", customerId);
      } else {
        customerRes = await ClientService.createClient(customerPayload);
        if (!customerRes?.success) {
          throw new Error(customerRes?.message || "Failed to create customer");
        }

        customerId = customerRes?.data?.id;
        if (!customerId) throw new Error("Customer ID not found in response");
        console.log("✅ Customer created:", customerId);

        customerIdRef.current = customerId;

        setValue("id", customerId);
      }

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

      let uploadedDocumentIds = [];
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        for (const doc of data.documents) {
          if (doc.file instanceof File) {
            const formData = new FormData();
            formData.append("document", doc.file);
            formData.append("document_name", doc.name || doc.file.name);
            const uploadRes = await CommonService.uploadDocuments(formData);
            if (!uploadRes?.success) {
              throw new Error(
                uploadRes?.message || "Failed to upload document"
              );
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
              throw new Error(linkRes?.message || "Failed to link document");
            }
          }
        }
      }

      toast.success(
        customerIdRef.current || id
          ? "✅ Customer updated successfully!"
          : "✅ Customer created successfully!"
      );

      reset();
      setUploadedDocuments([]);

      setTimeout(() => navigate("/suppliers"), 100);
    } catch (error) {
      console.error("❌ Error submitting customer data:", error);
      toast.error(
        error.message || "Failed to submit customer data. Please try again."
      );
    }
  };
 

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const response = await ClientService.getClientById(id);
          const clientAddress = await ClientService.getClientAddressById(id);
          const documents = await ClientService.getCustomerAllDocuments(id);

          const formattedDocuments = (documents?.data || []).map((doc) => ({
            id: doc.id,
            name: doc.document_name,
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
          setSupplier({
            ...response?.data,
            addresses: clientAddress?.data || [],
            documents: documents?.data || [],
          });

          setUploadedDocuments(formattedDocuments);

          reset({
            ...response?.data,
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
      />
    </FormLayout>
  );
};

export default AddSupplier;
