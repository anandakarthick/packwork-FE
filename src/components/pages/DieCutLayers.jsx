import { ChevronDown, ChevronRight, FileText, Plus, Star, StarOff, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SelectBox from "./SelectBox"; // adjust import path
import NumberInput from "./NumberInput"; // adjust import path
import LayoutVisualization from "./LayoutVisualization"; // optional preview per layout

const DieCutLayers = ({
  layouts,
  skuList,
  activeDie,
  addLayout,
  toggleLayoutExpanded,
  setDefaultLayout,
  removeLayout,
  updateLayout,
  addSkuToLayout,
  setSkuRow,
  removeSkuFromLayout,
  setShowNewSku
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200/50">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 text-zinc-800 font-semibold">
          <FileText className="h-5 w-5 text-indigo-600" />
          <span>Layout Configuration</span>
          <span className="text-xs font-normal text-zinc-500">
            ({layouts.length} layout{layouts.length !== 1 ? "s" : ""})
          </span>
        </div>
        <button
          onClick={addLayout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Layout
        </button>
      </div>

      <div className="p-4 space-y-2">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            className={`rounded-lg border ${
              layout.isExpanded
                ? "border-indigo-300 bg-indigo-50/30"
                : "border-zinc-200 bg-zinc-50/50"
            } transition-all`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-zinc-100 rounded-t-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLayoutExpanded(layout.id)}
                  className="p-0.5 hover:bg-zinc-100 rounded transition-colors"
                >
                  {layout.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <span className="text-sm font-semibold text-zinc-700">
                  {layout.name}
                </span>
                {layout.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-[10px] font-medium text-indigo-700">
                    <Star className="h-3 w-3 fill-current" /> Default
                  </span>
                )}
                <label className="cursor-pointer text-xs inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50 transition-colors">
                  <Upload className="h-3 w-3" />
                  <span>{layout.fileName ?? "File"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      updateLayout(layout.id, {
                        fileName: e.target.files?.[0]?.name,
                      })
                    }
                  />
                </label>
                {layout.skus.length > 0 && (
                  <span className="text-[10px] text-zinc-500">
                    {layout.skus.reduce((sum, s) => sum + s.ups, 0)} total UPS
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!layout.isDefault && (
                  <button
                    onClick={() => setDefaultLayout(layout.id)}
                    className="p-1 rounded hover:bg-zinc-100 group"
                    title="Set as default"
                  >
                    <StarOff className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-600" />
                  </button>
                )}
                {layouts.length > 1 && (
                  <button
                    onClick={() => removeLayout(layout.id)}
                    className="p-1 rounded hover:bg-zinc-100"
                  >
                    <X className="h-3.5 w-3.5 text-zinc-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Body */}
            <AnimatePresence>
              {layout.isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3">
                    {layout.skus.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        <div className="grid grid-cols-12 gap-1 text-[10px] font-medium text-zinc-500 px-2">
                          <div className="col-span-5">SKU</div>
                          <div className="col-span-2">UPS</div>
                          <div className="col-span-2">Wt(kg)</div>
                          <div className="col-span-2">Client</div>
                          <div className="col-span-1"></div>
                        </div>
                        {layout.skus.map((row) => {
                          const sku = skuList.find((s) => s.id === row.skuId);
                          return (
                            <div
                              key={row.id}
                              className="grid grid-cols-12 gap-1 items-center px-1 py-1 rounded bg-white border border-zinc-100"
                            >
                              <div className="col-span-5">
                                <SelectBox
                                  value={row.skuId}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "__new__") {
                                      setShowNewSku(true);
                                    } else {
                                      setSkuRow(layout.id, row.id, { skuId: val });
                                    }
                                  }}
                                  className="text-xs py-1"
                                >
                                  <option value="">Select SKU</option>
                                  {skuList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.internalCode} - {s.name}
                                    </option>
                                  ))}
                                  <option value="__new__">➕ New SKU</option>
                                </SelectBox>
                              </div>
                              <div className="col-span-2">
                                <NumberInput
                                  value={row.ups as any}
                                  onChange={(e) =>
                                    setSkuRow(layout.id, row.id, {
                                      ups: Number(e.target.value),
                                    })
                                  }
                                  min={1}
                                  className="text-xs py-1"
                                />
                              </div>
                              <div className="col-span-2">
                                <NumberInput
                                  value={row.netWeightKg as any}
                                  onChange={(e) =>
                                    setSkuRow(layout.id, row.id, {
                                      netWeightKg:
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value),
                                    })
                                  }
                                  className="text-xs py-1"
                                  step="0.001"
                                />
                              </div>
                              <div className="col-span-2 text-[10px] text-zinc-600 truncate px-1">
                                {sku?.client ?? "—"}
                              </div>
                              <div className="col-span-1 text-right">
                                <button
                                  onClick={() =>
                                    removeSkuFromLayout(layout.id, row.id)
                                  }
                                  className="p-0.5 rounded hover:bg-zinc-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => addSkuToLayout(layout.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-2 py-1 text-xs hover:border-zinc-400 hover:bg-white transition-all"
                      >
                        <Plus className="h-3 w-3" /> Add SKU
                      </button>

                      {layout.skus.length > 0 && activeDie && (
                        <div className="border border-zinc-200 rounded-lg p-2 bg-white">
                          <LayoutVisualization
                            layout={layout}
                            die={activeDie}
                            skuList={skuList}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DieCutLayers;
