import React, { useState } from "react";
import ReactDOM from "react-dom";

const GsmBfPicker = ({ value, onChange, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [gsmValues, setGsmValues] = useState([120, 150, 180, 200]);
  const [bfValues, setBfValues] = useState([16, 18, 20, 22]);
  const [selectedGsm, setSelectedGsm] = useState(value?.gsm || null);
  const [selectedBf, setSelectedBf] = useState(value?.bf || null);

  // inputs for adding new values
  const [newGsm, setNewGsm] = useState("");
  const [newBf, setNewBf] = useState("");

  const handleSave = () => {
    onChange({ gsm: selectedGsm, bf: selectedBf });
    setOpen(false);
  };

  const addGsm = () => {
    if (newGsm && !gsmValues.includes(Number(newGsm))) {
      setGsmValues((prev) => [...prev, Number(newGsm)]);
      setNewGsm("");
    }
  };

  const addBf = () => {
    if (newBf && !bfValues.includes(Number(newBf))) {
      setBfValues((prev) => [...prev, Number(newBf)]);
      setNewBf("");
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white shadow-lg rounded-lg p-6 w-[500px] relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium">Select GSM & BF</h4>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* GSM Panel */}
          <div>
            <h5 className="text-xs font-semibold mb-2">GSM</h5>
            <div className="grid grid-cols-2 gap-2">
              {gsmValues.map((g, i) => (
                <button
                  key={i}
                  className={`px-2 py-1 border rounded text-xs ${
                    selectedGsm === g ? "bg-blue-100 border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedGsm(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* BF Panel */}
          <div>
            <h5 className="text-xs font-semibold mb-2">BF</h5>
            <div className="grid grid-cols-2 gap-2">
              {bfValues.map((b, i) => (
                <button
                  key={i}
                  className={`px-2 py-1 border rounded text-xs ${
                    selectedBf === b ? "bg-green-100 border-green-500" : ""
                  }`}
                  onClick={() => setSelectedBf(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add GSM & BF Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Add GSM */}
          <div className="flex gap-2">
            <input
              type="number"
              value={newGsm}
              onChange={(e) => setNewGsm(e.target.value)}
              placeholder="Add GSM"
              className="flex-1 px-2 py-1 border rounded text-xs"
            />
            <button
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
              onClick={addGsm}
            >
              Add
            </button>
          </div>

          {/* Add BF */}
          <div className="flex gap-2">
            <input
              type="number"
              value={newBf}
              onChange={(e) => setNewBf(e.target.value)}
              placeholder="Add BF"
              className="flex-1 px-2 py-1 border rounded text-xs"
            />
            <button
              className="px-3 py-1 text-xs bg-green-500 text-white rounded"
              onClick={addBf}
            >
              Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 text-xs bg-gray-200 rounded"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
            onClick={handleSave}
            disabled={!selectedGsm || !selectedBf}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {/* Trigger Input */}
      <input
        type="text"
        readOnly
        disabled={readOnly}
        value={
          selectedGsm && selectedBf ? `${selectedGsm} GSM | ${selectedBf} BF` : ""
        }
        onClick={() => !readOnly && setOpen(true)}
        className="w-full px-2 py-1 border rounded text-xs text-center cursor-pointer bg-white focus:outline-none"
        placeholder="Select GSM & BF"
      />

      {/* Render Modal using Portal */}
      {open && ReactDOM.createPortal(modal, document.body)}
    </div>
  );
};

export default GsmBfPicker;
