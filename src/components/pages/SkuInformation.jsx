import { Truck } from "lucide-react";

export default function SkuInformation({
  register,
  errors,
  reset,
  watch,
  setValue,
  clientList,
  taxes,
}) {
  const method = watch("method_specifications.method");
  return (
    <div className="card-corrugated p-4 flex flex-col">
      <div className="mb-4 pb-2 border-b border-manufacturing-200">
        <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
          <div className="bg-primary-100 rounded-full p-1 mr-2">
            <Truck className="h-3 w-3 text-primary-600" />
          </div>
          SKU Information
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* SKU Type */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Sku Type *
          </label>
          <select
            {...register("subcategory", {
              required: "SKU Type is required",
            })}
            onChange={(e) => {
              reset((prev) => ({
                ...prev,
                subcategory: e.target.value,
              }));
            }}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
              errors.subcategory ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select SKU Type</option>
            <option value="RSC Box">RSC Box</option>
            <option value="Die-Cut">Die-Cut Box</option>
            <option value="Partition">Partition Box</option>
            <option value="Composite">Composite Box</option>
          </select>
          {errors.subcategory && (
            <p className="text-xs text-red-500 mt-1">
              {errors.subcategory.message}
            </p>
          )}
        </div>

        {/* Client */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Select Client*
          </label>
          <select
            {...register("manufacturer", {
              required: "Client is required",
            })}
            onChange={(e) => {
              reset((prev) => ({
                ...prev,
                manufacturer: e.target.value,
              }));
            }}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
              errors.manufacturer ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Client</option>
            {clientList.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </select>
          {errors.manufacturer && (
            <p className="text-xs text-red-500 mt-1">
              {errors.manufacturer.message}
            </p>
          )}
        </div>

        {/* SKU Name, Client Reference Code, Reference Number */}
        {[
          { label: "SKU Name *", name: "product_name", type: "text" },
          {
            label: "Client Reference Code *",
            name: "client_reference_code",
            type: "text",
          },
          {
            label: "Reference Number *",
            name: "reference_number",
            type: "text",
          },
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
              })}
              onChange={(e) => {
                const value = e.target.value;

                if (
                  field.name === "product_name" ||
                  field.name === "client_reference_code"
                ) {
                  const skuName =
                    field.name === "product_name"
                      ? value
                      : watch("product_name");
                  const clientCode =
                    field.name === "client_reference_code"
                      ? value
                      : watch("client_reference_code");

                  if (skuName || clientCode) {
                    setValue(
                      "reference_number",
                      `${skuName || ""}${skuName && clientCode ? "-" : ""}${
                        clientCode || ""
                      }`
                    );
                  }
                }
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                errors[field.name] ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={`Enter ${field.label
                .replace("*", "")
                .toLowerCase()}`}
              {...(field.name === "reference_number" ? { readOnly: true } : {})}
            />
            {errors[field.name] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[field.name].message}
              </p>
            )}
          </div>
        ))}

        {/* Stock Unit */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Stock Unit*
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
            <option value="Box">Box</option>
            <option value="Board">Board</option>
            <option value="Piece">Piece</option>
          </select>
          {errors.stock_unit && (
            <p className="text-xs text-red-500 mt-1">
              {errors.stock_unit.message}
            </p>
          )}
        </div>

        {/* Min Stock Level */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Min Stock Level *
          </label>
          <input
            type="text"
            {...register("min_stock_level", {
              required: "Min Stock Level is required",
            })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
              errors.min_stock_level ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter Min. Stock level"
          />
          {errors.min_stock_level && (
            <p className="text-xs text-red-500 mt-1">
              {errors.min_stock_level.message}
            </p>
          )}
        </div>

        {/* HSN Code */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            HSN Code *
          </label>
          <input
            type="text"
            {...register("tax_specifications.hsn_code", {
              required: "HSN Code is required",
            })}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
              errors.tax_specifications?.hsn_code
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter HSN code"
          />
          {errors.tax_specifications?.hsn_code && (
            <p className="text-xs text-red-500 mt-1">
              {errors.tax_specifications.hsn_code.message}
            </p>
          )}
        </div>

        {/* Tax */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Select Tax*
          </label>
          <select
            {...register("tax_specifications.gst_percentage", {
              required: "Tax is required",
            })}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
              errors.tax_specifications?.gst_percentage
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="">Select Tax</option>
            {taxes.map((tax) => (
              <option key={tax.tax_id} value={tax.tax_percentage}>
                {tax.tax_name} - {tax.tax_percentage}%
              </option>
            ))}
          </select>
          {errors.tax_specifications?.gst_percentage && (
            <p className="text-xs text-red-500 mt-1">
              {errors.tax_specifications.gst_percentage.message}
            </p>
          )}
        </div>

        {/* Method */}
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Method *
          </label>
          <select
            {...register("method_specifications.method", {
              required: "Method is required",
            })}
            onChange={(e) => {
              setValue("method_specifications.method", e.target.value);
            }}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
              errors.method_specifications?.method
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="">Select Method</option>
            <option value="Stiching Wire">Stiching Wire</option>
            <option value="Flap Pasting">Flap Pasting</option>
          </select>
          {errors.method_specifications?.method && (
            <p className="text-xs text-red-500 mt-1">
              {errors.method_specifications?.method.message}
            </p>
          )}
        </div>

        {method === "Stiching Wire" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Wire Type <span className="text-red-500">*</span>
              </label>

              <div
                className={`flex items-center space-x-4 h-10 px-3 rounded-md ${
                  errors.method_specifications?.wire_type
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
              >
                {["Single", "Double"].map((opt) => (
                  <label key={opt} className="flex items-center text-xs">
                    <input
                      type="radio"
                      value={opt}
                      {...register("method_specifications.wire_type", {
                        required: "Please select an option",
                      })}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {errors.method_specifications?.wire_type && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.method_specifications.wire_type.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Number of Pins *
              </label>
              <input
                type="text"
                {...register("method_specifications.number_of_pins", {
                  required: "HSN Code is required",
                })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                  errors.method_specifications?.number_of_pins
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter No. of Pins"
              />
              {errors.method_specifications?.number_of_pins && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.method_specifications.number_of_pins.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>

              <div
                className={`flex items-center space-x-4 h-10 px-3 rounded-md ${
                  errors.method_specifications?.position
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
              >
                {["Inside", "Outside"].map((opt) => (
                  <label key={opt} className="flex items-center text-xs">
                    <input
                      type="radio"
                      value={opt}
                      {...register("method_specifications.position", {
                        required: "Please select an option",
                      })}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {errors.method_specifications?.position && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.method_specifications.position.message}
                </p>
              )}
            </div>
          </>
        )}

        {method === "Flap Pasting" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Position <span className="text-red-500">*</span>
            </label>

            <div
              className={`flex items-center space-x-4 h-10 px-3 rounded-md ${
                errors.method_specifications?.position
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
            >
              {["Inside", "Outside"].map((opt) => (
                <label key={opt} className="flex items-center text-xs">
                  <input
                    type="radio"
                    value={opt}
                    {...register("method_specifications.position", {
                      required: "Please select an option",
                    })}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>

            {errors.method_specifications?.position && (
              <p className="text-red-500 text-xs mt-1">
                {errors.method_specifications.position.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
