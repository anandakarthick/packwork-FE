import React from "react";
import { CircuitBoard } from "lucide-react";

const BoardInformation = ({
  register,
  errors,
  watch,
  setValue,
  handleInputChange,
  handleUnitChange,
  helperBoard = 0,
  readOnly = false,
}) => {
  const fields = [
    { name: "joints", label: "Joints *", type: "number" },
    { name: "flap_width", label: "Flap Width *", type: "number" },
    { name: "ups", label: "UPS *", type: "number" },
    {
      name: "length_trimming_tolerance",
      label: "Length Trimming Tolerance *",
      type: "number",
    },
    {
      name: "width_trimming_tolerance",
      label: "Width Trimming Tolerance *",
      type: "number",
    },
  ];

  return (
    <div className="card-corrugated p-4 flex flex-col mt-4">
      <div className="mb-4 pb-2 border-b border-manufacturing-200">
        <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
          <div className="bg-primary-100 rounded-full p-1 mr-2">
            <CircuitBoard className="h-3 w-3 text-primary-600" />
          </div>
          Board Information
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Units *
          </label>
          {readOnly ? (
            <p className="text-sm text-gray-700">
              {watch("board_specifications.units")}
            </p>
          ) : (
            <select
              {...register("board_specifications.units")}
              onChange={(e) => handleUnitChange?.(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="in">inch</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Dimensions{" "}
            <span className="text-gray-500 text-xs">(L × W × H)</span>
            <span className="text-gray-500 ml-1">*</span>
          </label>

          {readOnly ? (
            <p className="text-sm text-gray-700">
              {`${watch("board_specifications.box_length")} × 
      ${watch("board_specifications.box_width")} × 
      ${watch("board_specifications.box_height")}`}
            </p>
          ) : (
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
                    onChange={(e) =>
                      handleInputChange?.(
                        `board_specifications.${key}`,
                        e.target.value
                      )
                    }
                    className="w-[28%] px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    placeholder={
                      key === "box_length"
                        ? "L"
                        : key === "box_width"
                        ? "W"
                        : "H"
                    }
                  />
                  {i < 2 && <span className="text-gray-500 text-xs">×</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {(errors?.board_specifications?.box_length ||
            errors?.board_specifications?.box_width ||
            errors?.board_specifications?.box_height) && (
            <p className="text-red-500 text-xs mt-1">
              Please enter dimensions (L × W × H)
            </p>
          )}
        </div>

        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              {field.label}
            </label>

            {readOnly ? (
              <p className="text-sm text-gray-700">
                {watch(`board_specifications.${field.name}`) || "--"}
              </p>
            ) : (
              <>
                <input
                  type={field.type}
                  step="any"
                  {...register(`board_specifications.${field.name}`, {
                    required: field.label.includes("*")
                      ? `${field.label.replace("*", "").trim()} is required`
                      : false,
                  })}
                  onChange={(e) =>
                    handleInputChange?.(
                      `board_specifications.${field.name}`,
                      e.target.value
                    )
                  }
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                    errors?.board_specifications?.[field.name]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder={`Enter ${field.label
                    .replace("*", "")
                    .toLowerCase()}`}
                />
                {errors?.board_specifications?.[field.name] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.board_specifications[field.name].message}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Deckle Size *
          </label>

          {readOnly ? (
            <p className="text-sm text-gray-700">
              {watch("board_specifications.deckle_size")}
            </p>
          ) : (
            <>
              <input
                type="number"
                step="0.01"
                {...register("board_specifications.deckle_size", {
                  required: "Deckle Size is required",
                })}
                onChange={(e) =>
                  handleInputChange?.(
                    "board_specifications.deckle_size",
                    e.target.value
                  )
                }
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                  errors.board_specifications?.deckle_size
                    ? "border-2 border-red-500"
                    : "border border-gray-300"
                }`}
                placeholder="Enter deckle size"
              />
              {errors.board_specifications?.deckle_size && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.board_specifications.deckle_size.message}
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Board Dimensions{" "}
            <span className="text-gray-500 text-xs">(L × W)</span>
            <span className="text-gray-500 ml-1">*</span>
          </label>

          <div
            className={`h-10 px-2 rounded-md flex items-center justify-between bg-white ${
              errors?.board_specifications?.board_length ||
              errors?.board_specifications?.board_width
                ? "border-2 border-red-500"
                : "border border-gray-300"
            }`}
          >
            <input
              type="number"
              {...register("board_specifications.board_length", {
                required: "Board length is required",
              })}
              className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
              placeholder="L"
              readOnly
            />
            <span className="text-gray-500 text-xs">×</span>
            <input
              type="number"
              {...register("board_specifications.board_width", {
                required: "Board width is required",
              })}
              className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
              placeholder="W"
              readOnly
            />
          </div>

          {(errors?.board_specifications?.board_length ||
            errors?.board_specifications?.board_width) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.board_specifications.board_length?.message ||
                errors.board_specifications.board_width?.message}
            </p>
          )}

          <p className="text-[10px] text-gray-500 mt-1">
            Board width per UPS: {helperBoard.toFixed(2)}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Inner / Outer Dimension <span className="text-red-500">*</span>
          </label>
          {readOnly ? (
            <p className="text-sm text-gray-700">
              {watch("board_specifications.inner_outer_dimension")}
            </p>
          ) : (
            <div
              className={`flex items-center space-x-4 h-10 px-3 rounded-md ${
                errors.board_specifications?.inner_outer_dimension
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
            >
              {["Inner", "Outer"].map((opt) => (
                <label key={opt} className="flex items-center text-xs">
                  <input
                    type="radio"
                    value={opt}
                    {...register("board_specifications.inner_outer_dimension", {
                      required: "Please select an option",
                    })}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {errors.board_specifications?.inner_outer_dimension && (
            <p className="text-red-500 text-xs mt-1">
              {errors.board_specifications.inner_outer_dimension.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardInformation;
