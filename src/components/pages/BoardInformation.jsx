import React from "react";
import { CircuitBoard } from "lucide-react";
import { Controller } from "react-hook-form";
import Select from "react-select/base";
import MultiSelectTags from "./MultiSelectTags";

const BoardInformation = ({
  register,
  errors,
  watch,
  handleInputChange,
  handleUnitChange,
  readOnly = false,
  control,
  routes,
  setValue,
  selectedPrintType,
}) => {
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

        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Trimming Tolerance (W | L) *
          </label>

          {readOnly ? (
            <p className="text-sm text-gray-700">
              {`${watch("board_specifications.width_trimming_tolerance")} | 
                ${watch("board_specifications.length_trimming_tolerance")}`}
            </p>
          ) : (
            <div
              className={`h-10 px-2 rounded-md flex items-center justify-between bg-white ${
                errors?.board_specifications?.width_trimming_tolerance ||
                errors?.board_specifications?.length_trimming_tolerance
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
            >
              {["width_trimming_tolerance", "length_trimming_tolerance"].map(
                (key, i) => (
                  <React.Fragment key={key}>
                    <input
                      type="number"
                      step="any"
                      {...register(`board_specifications.${key}`, {
                        required: `${key.replace("_", " ")} is required`,
                      })}
                      onChange={(e) =>
                        handleInputChange?.(
                          `board_specifications.${key}`,
                          e.target.value
                        )
                      }
                      className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                      placeholder={
                        key.includes("width") ? "Width Tol." : "Length Tol."
                      }
                    />
                    {i < 1 && <span className="text-gray-500 text-xs">|</span>}
                  </React.Fragment>
                )
              )}
            </div>
          )}

          {(errors?.board_specifications?.width_trimming_tolerance ||
            errors?.board_specifications?.length_trimming_tolerance) && (
            <p className="text-red-500 text-xs mt-1">
              Please enter trimming tolerances (W | L)
            </p>
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
              {...register("board_specifications.board_width", {
                required: "Board width is required",
              })}
              className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
              placeholder="W"
              readOnly
            />
            <span className="text-gray-500 text-xs">×</span>
            <input
              type="number"
              {...register("board_specifications.board_length", {
                required: "Board length is required",
              })}
              className="w-[45%] px-2 py-1 text-center text-xs focus:outline-none bg-gray-50 rounded"
              placeholder="L"
              readOnly
            />
          </div>

          {(errors?.board_specifications?.board_width ||
            errors?.board_specifications?.board_leght) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.board_specifications.board_width?.message ||
                errors.board_specifications.board_length?.message}
            </p>
          )}
        </div>

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
            Joints | Flap Width | UPS *
          </label>

          {readOnly ? (
            <p className="text-sm text-gray-700">
              {`${watch("board_specifications.joints")} | 
                ${watch("board_specifications.flap_width")} | 
                ${watch("board_specifications.ups")}`}
            </p>
          ) : (
            <div
              className={`h-10 px-2 rounded-md flex items-center justify-between bg-white ${
                errors?.board_specifications?.joints ||
                errors?.board_specifications?.flap_width ||
                errors?.board_specifications?.ups
                  ? "border-2 border-red-500"
                  : "border border-gray-300"
              }`}
            >
              {["joints", "flap_width", "ups"].map((key, i) => (
                <React.Fragment key={key}>
                  <input
                    type="number"
                    step="any"
                    {...register(`board_specifications.${key}`, {
                      required: `${key.replace("_", " ")} is required`,
                    })}
                    onChange={(e) =>
                      handleInputChange?.(
                        `board_specifications.${key}`,
                        e.target.value
                      )
                    }
                    className="w-[28%] px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    placeholder={
                      key === "joints"
                        ? "Joints"
                        : key === "flap_width"
                        ? "Flap"
                        : "UPS"
                    }
                  />
                  {i < 2 && <span className="text-gray-500 text-xs">|</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {(errors?.board_specifications?.joints ||
            errors?.board_specifications?.flap_width ||
            errors?.board_specifications?.ups) && (
            <p className="text-red-500 text-xs mt-1">
              Please enter Joints, Flap Width and UPS
            </p>
          )}
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

        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Select Routes*
          </label>
          <Controller
            control={control}
            name="route_specifications"
            rules={{ required: "At least one route is required" }}
            render={({ field }) => (
              <MultiSelectTags
                routes={routes}
                value={field.value || []}
                onChange={field.onChange}
              />
            )}
          />

          {errors?.route_specifications && (
            <p className="text-xs text-red-500 mt-1">
              {errors.route_specifications.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Print type *
          </label>
          {readOnly ? (
            <p className="text-sm text-gray-700">
              {watch("print_specifications.print_type")}
            </p>
          ) : (
            <select
              {...register("print_specifications.print_type")}
              onChange={(e) => {
                setValue("print_specifications.print_type", e.target.value);
                handleInputChange?.(e.target.value);
              }}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500"
            >
              <option value="Flexo">Flexo</option>
              <option value="Stereo">Stereo</option>
              <option value="Offset">Offset</option>
            </select>
          )}
        </div>

        {selectedPrintType === "Flexo" && (
          <div>
            <label className="block text-xs font-medium text-manufacturing-700 mb-1">
              Colors *
            </label>

            {readOnly ? (
              <div className="flex flex-wrap gap-2">
                {(watch("color_specifications") || []).map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1 border rounded-lg"
                  >
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: c.color_code }}
                    />
                    <span className="text-sm">{c.color_code}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="color"
                  onChange={(e) => {
                    const newColor = e.target.value;
                    const current = watch("color_specifications") || [];
                    // Avoid duplicate colors
                    if (!current.some((c) => c.color_code === newColor)) {
                      setValue("color_specifications", [
                        ...current,
                        { color_code: newColor },
                      ]);
                    }
                  }}
                  className="w-16 h-10 p-1 cursor-pointer border rounded"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {(watch("color_specifications") || []).map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1 border rounded-lg"
                    >
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: c.color_code }}
                      />
                      <span className="text-sm">{c.color_code}</span>
                      <button
                        type="button"
                        className="text-red-500 text-xs ml-2"
                        onClick={() => {
                          const filtered = (
                            watch("color_specifications") || []
                          ).filter((col) => col.color_code !== c.color_code);
                          setValue("color_specifications", filtered);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardInformation;
