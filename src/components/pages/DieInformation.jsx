import { CircuitBoard } from "lucide-react";
import { useEffect, useMemo } from "react";
import BoardVisualization from "./BoardVisualization";

const DieInformation = ({ register, errors, dieProducts, setValue, watch }) => {
  const selectedDieId = watch("die_specifications.die_id");
  const blankLength = watch("die_specifications.blank_length");
  const blankWidth = watch("die_specifications.blank_width");
  const upsLength = watch("die_specifications.ups_length");
  const upsWidth = watch("die_specifications.ups_width");

  const boardLength = watch("die_specifications.board_length");
  const boardWidth = watch("die_specifications.board_width");
  const totalBlanks = watch("die_specifications.total_blanks");

  useEffect(() => {
    if (blankLength && upsLength) {
      setValue("die_specifications.board_length", blankLength * upsLength);
    }
    if (blankWidth && upsWidth) {
      setValue("die_specifications.board_width", blankWidth * upsWidth);
    }
    if (upsLength && upsWidth) {
      setValue("die_specifications.total_blanks", upsLength * upsWidth);
    }
  }, [blankLength, blankWidth, upsLength, upsWidth, setValue]);

  useEffect(() => {
    if (selectedDieId) {
      const selectedDie = dieProducts.find((p) => p.id === selectedDieId);

      if (selectedDie && selectedDie.ProductVersions?.length) {
        const version = selectedDie.ProductVersions[0];
        const dieSpec = version.ProductDieSpecification?.[0]?.DieSpecification;

        if (dieSpec) {
          setValue("die_specifications.blank_length", dieSpec.board_length);
          setValue("die_specifications.blank_width", dieSpec.board_width);
          setValue("die_specifications.impressions", dieSpec.impressions);
          setValue("die_specifications.ups_length", dieSpec.ups_length || 1);
          setValue("die_specifications.ups_width", dieSpec.ups_width || 1);
        }
      }
    }
  }, [selectedDieId, dieProducts, setValue]);

  const productionConfig = useMemo(() => {
    if (!boardLength || !boardWidth) return null;

    return {
      actualBoardLength: Number(boardLength),
      actualBoardWidth: Number(boardWidth),
      upsAlongLength: Number(upsLength) || 1,
      upsAlongWidth: Number(upsWidth) || 1,
      totalBlanks: Number(totalBlanks) || 1,
    };
  }, [boardLength, boardWidth, upsLength, upsWidth, totalBlanks]);

  const selectedDie = useMemo(() => {
    return selectedDieId
      ? dieProducts.find((p) => p.id === selectedDieId)
      : null;
  }, [selectedDieId, dieProducts]);

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
              {...register("die_specifications.die_id", { required: true })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            >
              <option value="">Select Die</option>
              {dieProducts.map((product) => {
                const version = product.ProductVersions?.[0];
                const dieSpec =
                  version?.ProductDieSpecification?.[0]?.DieSpecification;

                return (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                    {dieSpec
                      ? ` (${dieSpec.board_length} x ${dieSpec.board_width})`
                      : ""}
                  </option>
                );
              })}
            </select>
            {errors?.die_specifications?.die_id && (
              <p className="text-xs text-red-500 mt-1">Please select a die</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium">Blank Length *</label>
            <input
              type="number"
              readOnly
              {...register("die_specifications.blank_length", {
                required: true,
              })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Enter Blank Length"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Blank Width *</label>
            <input
              type="number"
              readOnly
              {...register("die_specifications.blank_width", {
                required: true,
              })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Enter Blank Width"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">UPS Length *</label>
            <input
              type="number"
              {...register("die_specifications.ups_length", { required: true })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Enter UPS Length"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">UPS Width *</label>
            <input
              type="number"
              {...register("die_specifications.ups_width", { required: true })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              placeholder="Enter UPS Width"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Board Length</label>
            <input
              type="number"
              value={boardLength || ""}
              readOnly
              className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Board Width</label>
            <input
              type="number"
              value={boardWidth || ""}
              readOnly
              className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Total Blanks</label>
            <input
              type="number"
              value={totalBlanks || ""}
              readOnly
              className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      {productionConfig && (
        <div className="mt-6">
          <BoardVisualization
            dieData={{
              product_name: selectedDie?.product_name || "Blank",
              blankLength,
              blankWidth,
              boardLength: productionConfig.actualBoardLength,
              boardWidth: productionConfig.actualBoardWidth,
              upsLength: productionConfig.upsAlongLength,
              upsWidth: productionConfig.upsAlongWidth,
              totalBlanks: productionConfig.totalBlanks,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DieInformation;
