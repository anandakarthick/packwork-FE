import { CircuitBoard } from "lucide-react";
import React from "react";

const PartitionInformation = ({ register, dieProducts, errors }) => {
  return (
    <div>
      <div>
        <div className="card-corrugated p-4 flex flex-col mt-4">
          <div className="mb-4 pb-2 border-b border-manufacturing-200">
            <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
              <div className="bg-primary-100 rounded-full p-1 mr-2">
                <CircuitBoard className="h-3 w-3 text-primary-600" />
              </div>
              Partition Information
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Columns | Rows{" "}
                <span className="text-gray-500 text-xs">(C | R)</span>
                <span className="text-gray-500 ml-1">*</span>
              </label>

              <div
                className={`h-10 px-2 rounded-md flex items-center justify-between bg-white`}
              >
                <input
                  type="number"
                  {...register("partition_specifications.columns", {
                    required: true,
                  })}
                  className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
                  placeholder="Columns"
                />
                <span className="text-gray-500 text-xs">×</span>
                <input
                  type="number"
                  {...register("partition_specifications.rows", {
                    required: true,
                  })}
                  className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
                  placeholder="Rows"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Board Dimensions{" "}
                <span className="text-gray-500 text-xs">(W × L)</span>
                <span className="text-gray-500 ml-1">*</span>
              </label>

              <div
                className={`h-10 px-2 rounded-md flex items-center justify-between bg-white `}
              >
                <input
                  type="number"
                  {...register("partition_specifications.board_width", {
                    required: true,
                  })}
                  className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
                  placeholder="W"
                />
                <span className="text-gray-500 text-xs">×</span>
                <input
                  type="number"
                  {...register("partition_specifications.board_length", {
                    required: true,
                  })}
                  className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
                  placeholder="L"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium">Select Die *</label>
              <select
                {...register("partition_specifications.die_id", {
                  required: true,
                })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">Select Die</option>
                {dieProducts.map((product) => {
                  return (
                    <option key={product.id} value={product.id}>
                      {product.product_name}
                    </option>
                  );
                })}
              </select>
              {errors?.partition_specifications?.die_id && (
                <p className="text-xs text-red-500 mt-1">Please select a die</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium">UPS *</label>
              <input
                type="number"
                {...register("partition_specifications.ups", {
                  required: true,
                })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Enter UPS"
              />
            </div>
            {/* <div>
              <label className="block text-xs font-medium">Deckle Size *</label>
              <input
                type="number"
                {...register("partition_specifications.deckle_size", {
                  required: true,
                })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Enter Deckle Size"
              />
            </div> */}
            <div>
              <label className="block text-xs font-medium">
                Auto Calc Ratio *
              </label>
              <input
                type="number"
                {...register("partition_specifications.auto_calc_ratio", {
                  required: true,
                })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Enter Ratio"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartitionInformation;
