import React from "react";
import { Package, Layers, Edit, Trash2 } from "lucide-react";
import CompositeInformation from "./CompositeInformation";
import LayerConfiguration from "./LayerConfiguration";

const GroupPartSection = ({
  selectedSubcategory,
  groups,
  editingGroupId,
  setEditingGroupId,
  groupNameInput,
  setGroupNameInput,
  editingPartId,
  setEditingPartId,
  partNameInput,
  setPartNameInput,
  addGroup,
  addPart,
  removeGroup,
  removePart,
  updateGroupName,
  updatePartName,
  skuList,
  register,
  errors,
  fields,
  selectedPly,
  plyOptions,
  watch,
  setValue,
  updateLayer,
  copyFromPreviousLayer,
  hasPreviousLayerData,
  isCorrugationLayer,
  totalWeight,
  totalBurstingStrength,
  isStrictAdherence,
  flutes,
  colors,
  control,
  setGroups
}) => {
  return (
    <>
      {selectedSubcategory === "Composite" && (
        <div className="flex justify-end mb-4 mt-3">
          <button
            className="px-6 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-small shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
            onClick={(e) => {
              e.preventDefault();
              addGroup();
            }}
          >
            + Add Group
          </button>
        </div>
      )}

      {groups.map((group, groupIndex) => (
        <div key={group.id} className="card-corrugated p-6 mb-6 mt-4">
          {/* Group header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 border-b pb-2">
              {editingGroupId === group.id ? (
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  onBlur={() => {
                    updateGroupName(group.id, groupNameInput);
                    setEditingGroupId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateGroupName(group.id, groupNameInput);
                      setEditingGroupId(null);
                    }
                  }}
                  autoFocus
                  className="border rounded px-2 py-1 text-sm"
                />
              ) : (
                <>
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-800">
                    {group.name || "Group"}
                  </h3>
                </>
              )}

              {/* Edit + Delete buttons */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setEditingGroupId(group.id);
                  setGroupNameInput(group.name);
                }}
                className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeGroup(group.id);
                }}
                className="p-2 text-danger-600 hover:text-danger-800 hover:bg-danger-100 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {selectedSubcategory !== "RSC Box" && (
              <button
                className="px-6 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  addPart(group.id);
                }}
              >
                + Add Part
              </button>
            )}
          </div>

          {/* Parts inside group */}
          {group.parts.map((part, partIndex) => (
            <div key={part.id} className="card-corrugated p-6 mb-6 mt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 border-b pb-2">
                  {editingPartId === part.id ? (
                    <input
                      type="text"
                      value={partNameInput}
                      onChange={(e) => setPartNameInput(e.target.value)}
                      onBlur={() => {
                        updatePartName(group.id, part.id, partNameInput);
                        setEditingPartId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updatePartName(group.id, part.id, partNameInput);
                          setEditingPartId(null);
                        }
                      }}
                      autoFocus
                      className="border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <>
                      <Layers className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="text-base font-semibold text-gray-800">
                        {part.name || "Part"}
                      </h4>
                    </>
                  )}

                  {/* Edit + Delete part */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingPartId(part.id);
                      setPartNameInput(part.name);
                    }}
                    className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removePart(group.id, part.id);
                    }}
                    className="p-2 text-danger-600 hover:text-danger-800 hover:bg-danger-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Composite + Layer Config */}
              {selectedSubcategory === "Composite" && (
                <CompositeInformation
                  skuList={skuList}
                  register={register}
                  errors={errors}
                />
              )}

              <LayerConfiguration
                fields={fields}
                layers={group.parts[partIndex].layers}
                selectedPly={selectedPly}
                plyOptions={plyOptions}
                errors={errors}
                watch={watch}
                register={register}
                setValue={setValue}
                updateLayer={updateLayer}
                copyFromPreviousLayer={copyFromPreviousLayer}
                hasPreviousLayerData={hasPreviousLayerData}
                isCorrugationLayer={isCorrugationLayer}
                totalWeight={totalWeight}
                totalBurstingStrength={totalBurstingStrength}
                readOnly={isStrictAdherence}
                flutes={flutes}
                colors={colors}
                control={control}
                groupIndex={groupIndex}
                partIndex={partIndex}
                setGroups={setGroups}
                groups={groups}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default GroupPartSection;
