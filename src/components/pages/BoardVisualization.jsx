import { CircuitBoard } from "lucide-react";

const BoardVisualization = ({ dieData }) => {
  if (!dieData) return null;

  const {
    blankName,
    blankLength,
    blankWidth,
    boardLength,
    boardWidth,
    upsLength,
    upsWidth,
    totalBlanks,
  } = dieData;

  if (!blankLength || !blankWidth) {
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
        <p className="text-sm text-gray-500 text-center py-4">
          No board dimensions available
        </p>
      </div>
    );
  }

  const canvasSize = 400;
  const aspectRatio = boardWidth / boardLength;
  const displayWidth = aspectRatio >= 1 ? canvasSize : canvasSize * aspectRatio;
  const displayHeight =
    aspectRatio >= 1 ? canvasSize / aspectRatio : canvasSize;

  const blankDisplayWidth = displayWidth / upsWidth;
  const blankDisplayHeight = displayHeight / upsLength;

  const renderBlank = (index, x, y) => (
    <g key={`blank-${index}`}>
      <rect
        x={x}
        y={y}
        width={blankDisplayWidth}
        height={blankDisplayHeight}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth="0.8"
      />
      {blankDisplayHeight > 20 && blankDisplayWidth > 50 && (
        <text
          x={x + blankDisplayWidth / 2}
          y={y + blankDisplayHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-700 text-[10px] font-medium"
        >
          {blankName || `B${index + 1}`}
        </text>
      )}
    </g>
  );

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

      <div className="flex flex-col items-center space-y-3">
        <h2 className="text-lg font-semibold">
          Production Board ({boardWidth} × {boardLength} mm)
        </h2>
        <p className="text-sm font-medium">
          Total Blanks: {totalBlanks} ({upsLength} × {upsWidth})
        </p>

        <div className="flex">
          <div className="flex flex-col justify-center items-center mr-2 text-xs">
            <span className="-rotate-90 font-medium">{boardLength} mm</span>
          </div>

          <svg
            width={displayWidth + 40}
            height={displayHeight + 40}
            className="bg-white border-2 border-blue-400 rounded-md shadow-md"
          >
            {Array.from({ length: upsLength }).map((_, row) =>
              Array.from({ length: upsWidth }).map((_, col) => {
                const index = row * upsWidth + col;
                const x = 20 + col * blankDisplayWidth;
                const y = 20 + row * blankDisplayHeight;
                return renderBlank(index, x, y);
              })
            )}

            <rect
              x="20"
              y="20"
              width={displayWidth}
              height={displayHeight}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              rx="4"
            />
          </svg>

          <div className="flex flex-col justify-center items-center ml-2 text-xs">
            <span className="-rotate-90 font-medium">{boardLength} mm</span>
          </div>
        </div>

        <p className="text-sm">{boardWidth} mm</p>
      </div>
    </div>
  );
};

export default BoardVisualization;
