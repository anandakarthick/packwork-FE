import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Truck } from "lucide-react";
import FormLayout from "../form/FormLayout";
import { useNavigate, useParams } from "react-router-dom";
import { ProductService } from "../../services/ProductServices";

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [originalData, setOriginalData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      product_name: "",
      reference_number: "",
      client_reference_code: "",
      description: "",
      category: "",
      subcategory: "",
      stages: "",
      manufacturer: "",
      stock_unit: "",
      min_stock_level: "",
      reorder_level: "",
      status: "active",
      company_id: "comp-123",
      created_by: "user-001",

      reel_specifications: { reel_width: "", units: "mm" },
      layer_specifications: [{ gsm: "", bf: "", color_id: "" }],
      glue_specifications: { glue_type: "" },
      wire_specifications: { wire_type: "" },
      die_specifications: {
        board_length: "",
        board_width: "",
        impressions: "",
        ups: "",
      },
    },
  });

  const subcategory = watch("subcategory");
  const category = watch("category");

  const handleInputValidate = (e, type) => {
    if (type === "number") {
      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
    } else if (type === "text") {
      if (!/^[a-zA-Z0-9\s]*$/.test(e.key)) e.preventDefault();
    }
  };

  useEffect(() => {
    if (!id) return;

    ProductService.getById(id).then((res) => {
      if (!res.success) {
        alert("Error fetching product");
        navigate("/");
        return;
      }

      const product = res.data;
      const version = product.ProductVersions?.[0] || {};

      const productDieSpec = version.ProductDieSpecification?.[0] || {};
      const dieSpec = productDieSpec.DieSpecification || {};

      const mappedValues = {
        id: product.id,
        product_name: product.product_name || "",
        reference_number: product.reference_number || "",
        client_reference_code: product.client_reference_code || "",
        description: product.description || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        stages: product.stages || "",
        manufacturer: product.manufacturer || "",
        stock_unit: product.stock_unit || "",
        min_stock_level: product.min_stock_level || "",
        reorder_level: product.reorder_level || "",
        status: product.status || "active",
        reel_specifications: version.ReelSpecification
          ? {
              reel_width: version.ReelSpecification.reel_width || "",
              units: version.ReelSpecification.units || "mm",
            }
          : { reel_width: "", units: "mm" },

        layer_specifications: version.LayerSpecifications?.length
          ? version.LayerSpecifications.map((layer) => ({
              gsm: layer.gsm || "",
              bf: layer.bf || "",
              color_id: layer.color_id || "",
            }))
          : [{ gsm: "", bf: "", color_id: "" }],

        glue_specifications: version.GlueSpecification
          ? { glue_type: version.GlueSpecification.glue_type || "" }
          : { glue_type: "" },

        wire_specifications: version.WireSpecification
          ? { wire_type: version.WireSpecification.wire_type || "" }
          : { wire_type: "" },

        die_specifications: productDieSpec.DieSpecification
          ? {
              board_length: dieSpec.board_length || "",
              board_width: dieSpec.board_width || "",
              impressions: dieSpec.impressions || "",
              ups: dieSpec.ups || "",
            }
          : { board_length: "", board_width: "", impressions: "", ups: "" },

        ProductVersions: [
          {
            id: version.id,
            ReelSpecification: version.ReelSpecification
              ? { id: version.ReelSpecification.id }
              : null,
            LayerSpecifications: version.LayerSpecifications?.map((layer) => ({
              id: layer.id,
            })),
            GlueSpecification: version.GlueSpecification
              ? { id: version.GlueSpecification.id }
              : null,
            WireSpecification: version.WireSpecification
              ? { id: version.WireSpecification.id }
              : null,

            ProductDieSpecification: productDieSpec.id
              ? [
                  {
                    id: productDieSpec.id,
                    DieSpecification: dieSpec.id ? { id: dieSpec.id } : null,
                  },
                ]
              : [],
          },
        ],
      };

      setOriginalData(mappedValues);
      reset(mappedValues);
    });
  }, [id, reset, navigate]);

  useEffect(() => {
    if (!subcategory || id) return;

    const currentValues = getValues();

    let dynamicDefaults = {};
    switch (subcategory) {
      case "Reels":
        dynamicDefaults = {
          reel_specifications: { reel_width: "", units: "mm" },
          layer_specifications: [{ gsm: "", bf: "", color_id: "" }],
        };
        break;
      case "Pasting-glue":
      case "Corrugation-glue":
        dynamicDefaults = { glue_specifications: { glue_type: "" } };
        break;
      case "Stitching-wires":
        dynamicDefaults = { wire_specifications: { wire_type: "" } };
        break;
      case "Die":
        dynamicDefaults = {
          die_specifications: {
            board_length: "",
            board_width: "",
            impressions: "",
            ups: "",
          },
        };
        break;
      default:
        dynamicDefaults = {};
    }

    reset({ ...currentValues, ...dynamicDefaults });
  }, [subcategory, reset, getValues, id]);

  const deepDiff = (current, original) => {
    if (typeof current !== "object" || current === null) return current;
    if (Array.isArray(current)) {
      if (JSON.stringify(current) === JSON.stringify(original))
        return undefined;
      return current.map((item, index) =>
        typeof item === "object"
          ? deepDiff(item, original?.[index] || {})
          : item
      );
    }

    const diff = {};
    Object.keys(current).forEach((key) => {
      if (JSON.stringify(current[key]) !== JSON.stringify(original?.[key])) {
        if (typeof current[key] === "object" && current[key] !== null) {
          const nestedDiff = deepDiff(current[key], original?.[key]);
          if (nestedDiff !== undefined) diff[key] = nestedDiff;
        } else {
          diff[key] = current[key];
        }
      }
    });

    return Object.keys(diff).length > 0 ? diff : undefined;
  };

  const onSubmit = (data) => {
    if (!id) {
      ProductService.create(data).then((res) => {
        if (res.success) navigate("/");
        else alert("Error creating product: " + res.message);
      });
      return;
    }

    const changedData = deepDiff(data, originalData || {}) || {};
    let finalData = { ...changedData };
    if (originalData?.id) finalData.id = originalData.id;

    if (
      changedData.reel_specifications ||
      changedData.layer_specifications ||
      changedData.glue_specifications ||
      changedData.wire_specifications ||
      changedData.die_specifications
    ) {
      const originalVersion = originalData?.ProductVersions?.[0] || {};
      const pv = {
        id: originalVersion.id,
      };

      if (changedData.reel_specifications || changedData.layer_specifications) {
        pv.ReelSpecification = {
          id: originalVersion.ReelSpecification?.id,
          ...changedData.reel_specifications,
        };
        if (changedData.layer_specifications) {
          pv.LayerSpecifications = changedData.layer_specifications.map(
            (layer, i) => ({
              id: originalVersion.LayerSpecifications?.[i]?.id,
              ...layer,
            })
          );
        }
      }

      if (changedData.glue_specifications) {
        pv.GlueSpecification = {
          id: originalVersion.GlueSpecification?.id,
          ...changedData.glue_specifications,
        };
      }

      if (changedData.wire_specifications) {
        pv.WireSpecification = {
          id: originalVersion.WireSpecification?.id,
          ...changedData.wire_specifications,
        };
      }

      if (changedData.die_specifications) {
        pv.ProductDieSpecification = [
          {
            id: originalVersion.ProductDieSpecification?.[0]?.id,
            DieSpecification: {
              id: originalVersion.ProductDieSpecification?.[0]?.DieSpecification
                ?.id,
              ...changedData.die_specifications,
            },
          },
        ];
      }

      finalData.ProductVersions = [pv];

      delete finalData.reel_specifications;
      delete finalData.layer_specifications;
      delete finalData.glue_specifications;
      delete finalData.wire_specifications;
      delete finalData.die_specifications;
    }

    console.log("Final Payload with IDs:", finalData);

    ProductService.update(id, finalData).then((res) => {
      if (res.success) navigate("/");
      else alert("Error updating product: " + res.message);
    });
  };

  const subcategories = {
    "Raw-materials": [
      { value: "Reels", label: "Reels" },
      { value: "Pasting-glue", label: "Pasting Glue" },
      { value: "Stitching-wires", label: "Stitching wires" },
      { value: "Corrugation-glue", label: "Corrugation Glue" },
    ],
    Returnable: [
      { value: "Die", label: "Die" },
      // { value: "Stereo", label: "Stereo" },
    ],
    "Finished-goods": [],
    "Semi-Finished-goods": [],
  };

  return (
    <FormLayout
      title={id ? "Edit Product" : "Add New Product"}
      subtitle={
        id
          ? "Update product details and specifications"
          : "Create a new product record"
      }
      onCancel={() => navigate("/")}
      onSubmit={handleSubmit(onSubmit)}
      submitText={id ? "Update Product" : "Create Product"}
    >
      <div className="card-corrugated p-4 flex flex-col">
        <div className="mb-4 pb-2 border-b border-manufacturing-200">
          <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
            <div className="bg-primary-100 rounded-full p-1 mr-2">
              <Truck className="h-3 w-3 text-primary-600" />
            </div>
            Product Information
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              Category *
            </label>
            <select
              {...register("category", { required: "Category is required" })}
              onChange={(e) => {
                const currentValues = watch();
                reset({
                  ...currentValues,
                  category: e.target.value,
                  subcategory: "",
                });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Category</option>
              <option value="Raw-materials">Raw Materials</option>
              <option value="Returnable">Returnable</option>
              <option value="Finished-goods">Finished Goods</option>
              <option value="Semi-Finished-goods">Semi-Finished Goods</option>
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              Subcategory *
            </label>
            <select
              {...register("subcategory", {
                required: "subcategory is required",
              })}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                errors.subcategory ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Subcategory</option>
              {subcategories[category]?.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </select>
            {errors.subcategory && (
              <p className="text-xs text-red-500 mt-1">
                {errors.subcategory.message}
              </p>
            )}
          </div>
          <div></div><div></div>
          {[
            { label: "Product Name *", name: "product_name", type: "text" },
            {
              label: "Reference Number *",
              name: "reference_number",
              type: "text",
            },
            {
              label: "Client Reference Code *",
              name: "client_reference_code",
              type: "text",
            },
            { label: "Manufacturer", name: "manufacturer", type: "text" },
            {
              label: "Minimum Stock Level *",
              name: "min_stock_level",
              type: "number",
            },
            { label: "Reorder Level *", name: "reorder_level", type: "number" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                {...register(field.name, {
                  required: field.label.includes("*")
                    ? `${field.label.replace("*", "").trim()} is required`
                    : false,
                  min: field.type === "number" ? 0 : undefined,
                })}
                onKeyDown={(e) => handleInputValidate(e, field.type)}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={`Enter ${field.label
                  .replace("*", "")
                  .trim()
                  .toLowerCase()}`}
              />
              {errors[field.name] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[field.name].message}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              Stock Unit *
            </label>
            <select
              {...register("stock_unit", {
                required: "Stock Unit is required",
              })}
              onChange={(e) => {
                reset((prev) => ({
                  ...prev,
                  stock_unit: e.target.value,
                }));
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                errors.stock_unit ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Stock Unit</option>
              <option value="Kg">Kg</option>
              <option value="Litre">Litre</option>
              <option value="Box">Box</option>
              <option value="Board">Board</option>
              <option value="Piece">Piece</option>
              <option value="Meter">Meter</option>
            </select>
            {errors.stock_unit && (
              <p className="text-xs text-red-500 mt-1">
                {errors.stock_unit.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows="3"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500"
              placeholder="Enter product description"
            ></textarea>
          </div>
        </div>
      </div>
      {subcategory !== "" && (
        <>
          <div className="card-corrugated p-4 flex flex-col mt-4">
            <div className="mb-4 pb-2 border-b border-manufacturing-200">
              <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <Truck className="h-3 w-3 text-primary-600" />
                </div>
                {subcategory} Information
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {(subcategory === "Pasting-glue" ||
                subcategory === "Corrugation-glue") && (
                <div>
                  <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                    Glue Type *
                  </label>
                  <select
                    {...register("glue_specifications.glue_type", {
                      required: "Glue Type is required",
                    })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                      errors?.glue_specifications?.glue_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Glue Type</option>
                    <option value="Starch-based">Starch-based</option>
                    <option value="Casein">Casein</option>
                    <option value="Synthetic">Synthetic</option>
                  </select>
                  {errors?.glue_specifications?.glue_type && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.glue_specifications.glue_type.message}
                    </p>
                  )}
                </div>
              )}

              {subcategory === "Stitching-wires" && (
                <div>
                  <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                    Wire Type *
                  </label>
                  <select
                    {...register("wire_specifications.wire_type", {
                      required: "Wire Type is required",
                    })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                      errors?.wire_specifications?.wire_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Wire Type</option>
                    <option value="Galvanized">Galvanized</option>
                    <option value="Stainless Steel">Stainless Steel</option>
                    <option value="Copper-coated">Copper-coated</option>
                  </select>
                  {errors?.wire_specifications?.wire_type && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.wire_specifications.wire_type.message}
                    </p>
                  )}
                </div>
              )}

              {subcategory === "Reels" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      GSM *
                    </label>
                    <input
                      type="number"
                      {...register("layer_specifications.0.gsm", {
                        required: "GSM is required",
                        min: { value: 0, message: "GSM cannot be negative" },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.layer_specifications?.[0]?.gsm
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter GSM (e.g. 120)"
                    />
                    {errors?.layer_specifications?.[0]?.gsm && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.layer_specifications[0].gsm.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      BF *
                    </label>
                    <input
                      type="number"
                      {...register("layer_specifications.0.bf", {
                        required: "BF is required",
                        min: { value: 0, message: "BF cannot be negative" },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.layer_specifications?.[0]?.bf
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter BF (e.g. 18)"
                    />
                    {errors?.layer_specifications?.[0]?.bf && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.layer_specifications[0].bf.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Color ID *
                    </label>
                    <input
                      type="text"
                      {...register("layer_specifications.0.color_id", {
                        required: "Color ID is required",
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.layer_specifications?.[0]?.color_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Color ID (e.g. color-001)"
                    />
                    {errors?.layer_specifications?.[0]?.color_id && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.layer_specifications[0].color_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Reel Width *
                    </label>
                    <input
                      type="number"
                      {...register("reel_specifications.reel_width", {
                        required: "Reel Width is required",
                        min: {
                          value: 0,
                          message: "Reel Width cannot be negative",
                        },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.reel_specifications?.reel_width
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Reel Width (e.g. 1200)"
                    />
                    {errors?.reel_specifications?.reel_width && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.reel_specifications.reel_width.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Units *
                    </label>
                    <select
                      {...register("reel_specifications.units", {
                        required: "Unit is required",
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.reel_specifications?.units
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                    {errors?.reel_specifications?.units && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.reel_specifications.units.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {subcategory === "Die" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Board Length *
                    </label>
                    <input
                      type="number"
                      {...register("die_specifications.board_length", {
                        required: "Board Length is required",
                        min: {
                          value: 0,
                          message: "Board Length cannot be negative",
                        },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.die_specifications?.board_length
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Board Length"
                    />
                    {errors?.die_specifications?.board_length && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.die_specifications.board_length.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Board Width *
                    </label>
                    <input
                      type="number"
                      {...register("die_specifications.board_width", {
                        required: "Board Width is required",
                        min: {
                          value: 0,
                          message: "Board Width cannot be negative",
                        },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.die_specifications?.board_width
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Board Width"
                    />
                    {errors?.die_specifications?.board_width && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.die_specifications.board_width.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Impressions *
                    </label>
                    <input
                      type="number"
                      {...register("die_specifications.impressions", {
                        required: "Impressions is required",
                        min: {
                          value: 0,
                          message: "Impressions cannot be negative",
                        },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.die_specifications?.impressions
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Impressions"
                    />
                    {errors?.die_specifications?.impressions && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.die_specifications.impressions.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                      Ups *
                    </label>
                    <input
                      type="number"
                      {...register("die_specifications.ups", {
                        required: "Ups is required",
                        min: { value: 0, message: "Ups cannot be negative" },
                      })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                        errors?.die_specifications?.ups
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter Ups"
                    />
                    {errors?.die_specifications?.ups && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.die_specifications.ups.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </FormLayout>
  );
};

export default AddProduct;
