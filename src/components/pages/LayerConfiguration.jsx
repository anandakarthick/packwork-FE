import React from "react";
import { Package, Copy } from "lucide-react";

const LayerConfiguration = ({
  fields,
  layers,
  selectedPly,
  plyOptions,
  fluteTypes,
  errors,
  watch,
  register,
  setValue,
  updateLayer,
  copyFromPreviousLayer,
  hasPreviousLayerData,
  isCorrugationLayer,
  totalWeight,
  totalBurstingStrength,
  readOnly = false,
}) => {
  console.log("LayerConfiguration layers", layers);
  return (
    <div className="card-corrugated p-6 mb-6 mt-4">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
        <Package className="h-5 w-5 mr-2 text-blue-600" />
        Layer Configuration
      </h3>
      <div className="flex items-center gap-8 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Ply<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-[250px]">
            <div
              className={`relative w-full h-[30px] bg-white rounded-md shadow-xs flex items-center overflow-hidden transition-colors ${
                errors?.board_specifications?.ply
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              } ${readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <input
                type="hidden"
                {...register("board_specifications.ply")}
                value={selectedPly}
                readOnly={readOnly}
              />

              <div
                className="absolute top-1/2 h-[75%] rounded-md transform -translate-y-1/2 transition-all duration-300 z-0 bg-gradient-to-r from-corrugated-600 to-corrugated-700"
                style={{
                  left: `${
                    (plyOptions.indexOf(selectedPly) * 100) /
                      plyOptions.length +
                    1
                  }%`,
                  width: `${100 / plyOptions.length - 2}%`,
                }}
              ></div>

              {plyOptions.map((option) => (
                <span
                  key={option}
                  onClick={() =>
                    !readOnly && setValue("board_specifications.ply", option)
                  }
                  className={`flex-1 text-center text-xs font-medium transition-colors z-10 py-1 ${
                    selectedPly === option ? "text-white" : "text-gray-700"
                  } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                  style={{ width: `${100 / plyOptions.length}%` }}
                >
                  {option}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Ply {selectedPly} will create {selectedPly} layers
            </p>
            {errors?.board_specifications?.ply && !readOnly && (
              <p className="text-red-500 text-xs mt-1">
                {errors.board_specifications.ply.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-700">
            Strict Adherence for All Layers
          </label>
          <div className="relative">
            <input
              type="checkbox"
              {...register("board_specifications.strict_adherence")}
              className="sr-only"
              disabled={readOnly}
            />
            <div
              className={`w-12 h-6 rounded-full transition-all duration-200 shadow-md flex items-center ${
                readOnly ? "cursor-default opacity-70" : "cursor-pointer"
              } ${
                watch("board_specifications.strict_adherence")
                  ? "bg-gradient-to-r from-corrugated-600 to-corrugated-700"
                  : "bg-gray-300"
              }`}
              onClick={() => {
                if (readOnly) return;
                const checkbox = document.querySelector(
                  'input[name="board_specifications.strict_adherence"]'
                );
                if (checkbox) checkbox.click();
              }}
            >
              <div
                className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 pointer-events-none"
                style={{
                  transform: watch("board_specifications.strict_adherence")
                    ? "translateX(1.5rem)"
                    : "translateX(0.25rem)",
                }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-600">
            {watch("board_specifications.strict_adherence")
              ? "Enabled"
              : "Disabled"}
          </span>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-8">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LAYER
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  colSpan="3"
                >
                  GSM / BF / COLOR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FLUTE TYPE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WEIGHT (KG)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BURSTING STRENGTH (KG/CM²)
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>{field.layer_name}</span>
                      {!readOnly && index > 0 && (
                        <button
                          type="button"
                          onClick={() => copyFromPreviousLayer(index)}
                          disabled={!hasPreviousLayerData(index)}
                          className={`p-1 rounded transition-colors ${
                            hasPreviousLayerData(index)
                              ? "text-blue-600 hover:text-blue-800 hover:bg-blue-100 bg-blue-50"
                              : "text-gray-400 hover:text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500" colSpan="3">
                    <div
                      className={`bg-gray-50 border border-gray-200 rounded-lg p-2 min-w-[280px] ${
                        readOnly ? "opacity-70" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col w-full">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`layer_specifications.${index}.gsm`, {
                              required: "GSM is required",
                            })}
                            value={layers[index]?.gsm || ""}
                            onChange={(e) =>
                              !readOnly &&
                              updateLayer(index, "gsm", e.target.value)
                            }
                            disabled={readOnly}
                            className={`w-full px-2 py-1 border rounded text-xs text-center focus:outline-none transition-colors ${
                              errors?.layer_specifications?.[index]?.gsm
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${
                              readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                            } focus:ring-1 focus:ring-blue-500`}
                            placeholder="GSM"
                          />
                          <span className="h-4 text-[10px] text-red-500">
                            {
                              errors?.layer_specifications?.[index]?.gsm
                                ?.message
                            }
                          </span>
                        </div>

                        <div className="flex flex-col w-full">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`layer_specifications.${index}.bf`, {
                              required: "BF is required",
                            })}
                            value={layers[index]?.bf || ""}
                            onChange={(e) =>
                              !readOnly &&
                              updateLayer(index, "bf", e.target.value)
                            }
                            disabled={readOnly}
                            className={`w-full px-2 py-1 border rounded text-xs text-center focus:outline-none transition-colors ${
                              errors?.layer_specifications?.[index]?.bf
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${
                              readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                            } focus:ring-1 focus:ring-blue-500`}
                            placeholder="BF"
                          />
                          <span className="h-4 text-[10px] text-red-500">
                            {errors?.layer_specifications?.[index]?.bf?.message}
                          </span>
                        </div>

                        <div className="flex flex-col w-full">
                          <input
                            type="text"
                            {...register(
                              `layer_specifications.${index}.color_id`,
                              {
                                required: "Color is required",
                              }
                            )}
                            value={layers[index]?.color_id || ""}
                            onChange={(e) =>
                              !readOnly &&
                              updateLayer(index, "color_id", e.target.value)
                            }
                            disabled={readOnly}
                            className={`w-full px-2 py-1 border rounded text-xs focus:outline-none transition-colors ${
                              errors?.layer_specifications?.[index]?.color_id
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${
                              readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                            } focus:ring-1 focus:ring-blue-500`}
                            placeholder="Color"
                          />
                          <span className="h-4 text-[10px] text-red-500">
                            {
                              errors?.layer_specifications?.[index]?.color_id
                                ?.message
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {isCorrugationLayer(field.layer_name) ? (
                      <div className="flex flex-col">
                        <select
                          {...register(
                            `layer_specifications.${index}.flute_type`,
                            {
                              required: "Flute type is required",
                            }
                          )}
                          value={layers[index]?.flute_type || ""}
                          onChange={(e) =>
                            !readOnly &&
                            updateLayer(index, "flute_type", e.target.value)
                          }
                          disabled={readOnly}
                          className={`w-full px-2 py-1 border rounded text-xs focus:outline-none transition-colors ${
                            errors?.layer_specifications?.[index]?.flute_type
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${
                            readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                          } focus:ring-1 focus:ring-blue-500`}
                        >
                          <option value="">Select Flute</option>
                          {fluteTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>

                        {!readOnly &&
                          errors?.layer_specifications?.[index]?.flute_type && (
                            <p className="text-xs text-red-500 mt-1">
                              {
                                errors.layer_specifications[index].flute_type
                                  .message
                              }
                            </p>
                          )}
                      </div>
                    ) : (
                      <div className="w-16 px-2 py-1 text-center text-gray-400 text-sm">
                        --
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-green-600">
                      {layers[index]?.weight
                        ? parseFloat(layers[index].weight).toFixed(3)
                        : "0.000"}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-blue-600">
                      {layers[index]?.bursting_strength
                        ? parseFloat(layers[index].bursting_strength).toFixed(3)
                        : "0.000"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between mt-4">
        <div
          className="w-40 rounded-md p-2"
          style={{ backgroundColor: "#f3e5f5", border: "1px solid #e1bee7" }}
        >
          <p
            className="text-[11px] font-medium uppercase mb-0.5"
            style={{ color: "#4a5568" }}
          >
            TOTAL LAYERS
          </p>
          <p className="text-[11px] font-bold" style={{ color: "#2d3748" }}>
            {fields.length}
          </p>
        </div>

        <div className="flex gap-2 mr-16">
          <div
            className="w-40 rounded-md p-2"
            style={{ backgroundColor: "#e8f5e9", border: "1px solid #c8e6c9" }}
          >
            <p
              className="text-[11px] font-medium uppercase mb-0.5"
              style={{ color: "#4a5568" }}
            >
              TOTAL WEIGHT
            </p>
            <p className="text-[11px] font-bold" style={{ color: "#2d3748" }}>
              {totalWeight > 0 ? totalWeight.toFixed(3) : "0.000"} kg
            </p>
          </div>

          <div
            className="w-40 rounded-md p-2"
            style={{ backgroundColor: "#e3f2fd", border: "1px solid #bbdefb" }}
          >
            <p
              className="text-[11px] font-medium uppercase mb-0.5"
              style={{ color: "#4a5568" }}
            >
              BURSTING STRENGTH
            </p>
            <p className="text-[11px] font-bold" style={{ color: "#2d3748" }}>
              {totalBurstingStrength > 0
                ? totalBurstingStrength.toFixed(3)
                : "0.000"}{" "}
              Kg/cm²
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerConfiguration;
