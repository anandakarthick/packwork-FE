import { CircuitBoard } from "lucide-react";
import { useEffect } from "react";

const DieInformation = ({ register, errors, dieProducts, setValue, watch }) => {
  const selectedDieId = watch("sku_die_specifications.die_id");

  useEffect(() => {
    if (selectedDieId) {
      const selectedDie = dieProducts.find((p) => p.id === selectedDieId);
      const version = selectedDie?.ProductVersions?.[0];
      const dieSpec = version?.ProductDieSpecification?.[0]?.DieSpecification;

      if (dieSpec) {
        setValue("sku_die_specifications.board_length", dieSpec.board_length);
        setValue("sku_die_specifications.board_width", dieSpec.board_width);

        setValue("sku_die_specifications.ups", dieSpec.ups || 1);
        const deckle_size =
          (dieSpec.board_length + dieSpec.board_width) * dieSpec.ups;
        setValue("sku_die_specifications.deckle_size", deckle_size);
      }
    }
  }, [selectedDieId, dieProducts, setValue]);

  return (
    <div>
      <div className="card-corrugated p-4 flex flex-col mt-4">
        <div className="mb-4 pb-2 border-b border-manufacturing-200">
          <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
            <div className="bg-primary-100 rounded-full p-1 mr-2">
              <CircuitBoard className="h-3 w-3 text-primary-600" />
            </div>
            Die Information
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium">Select Die *</label>
            <select
              {...register("sku_die_specifications.die_id", { required: true })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            >
              <option value="">Select Die</option>
              {dieProducts.map((product) => {
                // const version = product.ProductVersions?.[0];
                // const dieSpec =
                //   version?.ProductDieSpecification?.[0]?.DieSpecification;

                return (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                    {/* {dieSpec
                      ? ` (${dieSpec.board_length} x ${dieSpec.board_width})`
                      : ""} */}
                  </option>
                );
              })}
            </select>
            {errors?.sku_die_specifications?.die_id && (
              <p className="text-xs text-red-500 mt-1">Please select a die</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              Board Dimensions{" "}
              <span className="text-gray-500 text-xs">(W × L)</span>
              <span className="text-gray-500 ml-1">*</span>
            </label>

            <div
              className={`h-10 px-2 rounded-md flex items-center justify-between bg-white ${
                errors?.board_specifications?.board_width ||
                errors?.board_specifications?.board_length
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
            >
              <input
                type="number"
                {...register("sku_die_specifications.board_width", {
                  required: true,
                })}
                className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
                placeholder="W"
                readOnly
              />
              <span className="text-gray-500 text-xs">×</span>
              <input
                type="number"
                {...register("sku_die_specifications.board_length", {
                  required: true,
                })}
                className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
                placeholder="L"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium">UPS *</label>
            <input
              type="number"
              {...register("sku_die_specifications.ups", { required: true })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Enter UPS"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Deckle Size *</label>
            <input
              type="number"
              {...register("sku_die_specifications.deckle_size", {
                required: true,
              })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Enter Deckle Size"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DieInformation;
