import React from "react";
import { Copy } from "lucide-react";
import CustomColorDropdown from "./CustomColorDropdown";
import GsmBfPicker from "./GSMBFPicker";
import toast from "react-hot-toast";

const LayerConfiguration = ({
  fields,
  layers,
  selectedPly,
  plyOptions,
  errors,
  watch,
  register,
  updateLayer,
  copyFromPreviousLayer,
  hasPreviousLayerData,
  isCorrugationLayer,
  totalWeight,
  totalBurstingStrength,
  readOnly = false,
  flutes,
  colors,
  groupIndex,
  partIndex,
  setGroups,
  groups,
}) => {
  const part = groups?.[groupIndex]?.parts?.[partIndex] || {
    ply: "",
    layers: [],
  };
  const handlePlyChange = (groupIndex, partIndex, newPly) => {
    console.log("Changing ply to:", newPly);

    setGroups((prevGroups) => {
      return prevGroups.map((group, gIdx) => {
        if (gIdx !== groupIndex) return group;

        const updatedParts = group.parts.map((part, pIdx) => {
          if (pIdx !== partIndex) return part;

          // Adjust layers count based on new ply
          const existingLayers = part.layers || [];
          const newLayers = Array.from({ length: newPly }, (_, i) => {
            return (
              existingLayers[i] || {
                layer_id: i + 1,
                layer_name: `Layer ${i + 1}`,
                gsm: "",
                bf: "",
                flute_type: "",
                color_id: "",
                weight: "",
                bursting_strength: "",
              }
            );
          });

          // Return new part object (no mutation)
          return {
            ...part,
            ply: newPly,
            layers: newLayers,
          };
        });

        return {
          ...group,
          parts: updatedParts,
        };
      });
    });

    toast.success(`Updated to ${newPly}-Ply for Part ${partIndex + 1}`);
  };

  return (
    <div>
      {/* PLY SELECTION + STRICT ADHERENCE SWITCH */}
      <div className="flex items-center gap-8 mb-6">
        {/* Ply selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Ply<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-[350px]">
            <div
              className={`relative w-full h-[30px] bg-white rounded-md shadow-xs flex items-center overflow-hidden transition-colors ${
                errors?.board_specifications?.ply
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              } ${readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <input
                type="hidden"
                value={part?.ply ?? ""}
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
                  onClick={() => {
                    if (!readOnly)
                      handlePlyChange(groupIndex, partIndex, option);
                  }}
                  className={`flex-1 text-center text-xs font-medium transition-colors z-10 py-1 ${
                    part.ply === option ? "text-white" : "text-gray-700"
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

        {/* Strict adherence switch */}
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
        </div>
      </div>

      {/* LAYERS TABLE */}
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
              {fields.map((field, layerIndex) => (
                <tr
                  key={field.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Layer Name + Copy */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>{field.layer_name}</span>
                      {!readOnly && layerIndex > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            copyFromPreviousLayer(
                              groupIndex,
                              partIndex,
                              layerIndex
                            )
                          }
                          disabled={!hasPreviousLayerData(layerIndex)}
                          className={`p-1 rounded transition-colors ${
                            hasPreviousLayerData(layerIndex)
                              ? "text-blue-600 hover:text-blue-800 hover:bg-blue-100 bg-blue-50"
                              : "text-gray-400 hover:text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* GSM / BF / COLOR */}
                  <td className="px-4 py-3 text-xs text-gray-500" colSpan="3">
                    <div
                      className={`bg-gray-50 border border-gray-200 rounded-lg p-2 min-w-[280px] ${
                        readOnly ? "opacity-70" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GsmBfPicker
                          value={{
                            gsm: layers[layerIndex]?.gsm,
                            bf: layers[layerIndex]?.bf,
                          }}
                          onChange={(val) => {
                            updateLayer(
                              groupIndex,
                              partIndex,
                              layerIndex,
                              "gsm",
                              val.gsm
                            );
                            updateLayer(
                              groupIndex,
                              partIndex,
                              layerIndex,
                              "bf",
                              val.bf
                            );
                          }}
                          readOnly={readOnly}
                        />

                        <CustomColorDropdown
                          colors={colors}
                          value={layers[layerIndex]?.color_id || ""}
                          onChange={(colorId) =>
                            updateLayer(
                              groupIndex,
                              partIndex,
                              layerIndex,
                              "color_id",
                              colorId
                            )
                          }
                          error={
                            errors?.layer_specifications?.[layerIndex]?.color_id
                              ?.message
                          }
                          readOnly={readOnly}
                          placeholder="Select Color"
                        />
                      </div>
                    </div>
                  </td>

                  {/* FLUTE TYPE */}
                  <td className="px-4 py-3">
                    {isCorrugationLayer(field.layer_name) ? (
                      <select
                        {...register(
                          `layer_specifications.${layerIndex}.flute_type`,
                          {
                            required: "Flute type is required",
                          }
                        )}
                        value={layers[layerIndex]?.flute_type || ""}
                        onChange={(e) =>
                          !readOnly &&
                          updateLayer(
                            groupIndex,
                            partIndex,
                            layerIndex,
                            "flute_type",
                            e.target.value
                          )
                        }
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border rounded text-xs focus:outline-none transition-colors ${
                          errors?.layer_specifications?.[layerIndex]?.flute_type
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${
                          readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                        } focus:ring-1 focus:ring-blue-500`}
                      >
                        <option value="">Select Flute</option>
                        {flutes.map((flute) => (
                          <option key={flute.id} value={flute.id}>
                            {flute.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-16 px-2 py-1 text-center text-gray-400 text-sm">
                        --
                      </div>
                    )}
                  </td>

                  {/* WEIGHT */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-green-600">
                      {layers[layerIndex]?.weight
                        ? parseFloat(layers[layerIndex].weight).toFixed(3)
                        : "0.000"}
                    </span>
                  </td>

                  {/* BURSTING STRENGTH */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-blue-600">
                      {layers[layerIndex]?.bursting_strength
                        ? parseFloat(
                            layers[layerIndex].bursting_strength
                          ).toFixed(3)
                        : "0.000"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TOTALS */}
      <div className="flex justify-between mt-4">
        <div className="w-40 rounded-md p-2"></div>
        <div className="flex gap-2 mr-16">
          <div
            className="w-40 rounded-md p-2"
            style={{ backgroundColor: "#e8f5e9", border: "1px solid #c8e6c9" }}
          >
            <p className="text-[11px] font-medium uppercase mb-0.5 text-gray-700">
              TOTAL WEIGHT
            </p>
            <p className="text-[11px] font-bold text-gray-800">
              {totalWeight > 0 ? totalWeight.toFixed(3) : "0.000"} kg
            </p>
          </div>

          <div
            className="w-40 rounded-md p-2"
            style={{ backgroundColor: "#e3f2fd", border: "1px solid #bbdefb" }}
          >
            <p className="text-[11px] font-medium uppercase mb-0.5 text-gray-700">
              BURSTING STRENGTH
            </p>
            <p className="text-[11px] font-bold text-gray-800">
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
