import { CircuitBoard } from "lucide-react";
import React from "react";

const CompositeInformation = ({ skuList, register, errors }) => {
  return (
    <div>
      <div>
        <div>
          <div className="p-4 flex flex-col mt-4">
            {/* <div className="mb-4 pb-2 border-b border-manufacturing-200">
              <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <CircuitBoard className="h-3 w-3 text-primary-600" />
                </div>
                Partition Information
              </h3>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium">
                  Select SKU *
                </label>
                <select
                  {...register("composite_specifications.sku_id", {
                    required: true,
                  })}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                >
                  <option value="">Select SKU</option>
                  {skuList.map((product) => {
                    if (
                      product.subcategory !== "Group" &&
                      product.subcategory !== "Part"
                    ) {
                      return (
                        <option
                          key={product.id}
                          value={product?.ProductVersions[0]?.id}
                        >
                          {product.product_name} - {product.subcategory}
                        </option>
                      );
                    }
                  })}
                </select>
                {errors?.composite_specifications?.sku_id && (
                  <p className="text-xs text-red-500 mt-1">Please select sku</p>
                )}
              </div>

              {/* <div>
            <label className="block text-xs font-medium">Board Length *</label>
            <input
              type="number"
              value={boardLength || ""}
              readOnly
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Board Width *</label>
            <input
              type="number"
              value={boardWidth || ""}
              readOnly
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div> */}

              {/* <div>
                <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                  Dimensions{" "}
                  <span className="text-gray-500 text-xs">(L × W × H)</span>
                  <span className="text-gray-500 ml-1">*</span>
                </label>

                <div
                  className={`h-10 px-2 rounded-md flex items-center justify-between bg-white ${
                    errors?.board_specifications?.box_length ||
                    errors?.board_specifications?.box_width ||
                    errors?.board_specifications?.box_height
                      ? "border-2 border-red-500"
                      : "border border-gray-300"
                  }`}
                >
                  {["box_length", "box_width", "box_height"].map((key, i) => (
                    <React.Fragment key={key}>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`board_specifications.${key}`, {
                          required: `${key
                            .replace("box_", "")
                            .toUpperCase()} is required`,
                        })}
                        // onChange={(e) =>
                        //   handleInputChange?.(
                        //     `board_specifications.${key}`,
                        //     e.target.value
                        //   )
                        // }
                        className="w-[28%] px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        placeholder={
                          key === "box_length"
                            ? "L"
                            : key === "box_width"
                            ? "W"
                            : "H"
                        }
                      />
                      {i < 2 && (
                        <span className="text-gray-500 text-xs">×</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {(errors?.board_specifications?.box_length ||
                  errors?.board_specifications?.box_width ||
                  errors?.board_specifications?.box_height) && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter dimensions (L × W × H)
                  </p>
                )}
              </div> */}

              <div>
                <label className="block text-xs font-medium">Quantity *</label>
                <input
                  type="number"
                  {...register("composite_specifications.quantity", {
                    required: true,
                  })}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                  placeholder="Enter Quantity"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositeInformation;
