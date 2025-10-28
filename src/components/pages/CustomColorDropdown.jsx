import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

const CustomColorDropdown = ({
  colors,
  value,
  onChange,
  error,
  readOnly = false,
  placeholder = "Select Color",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedParents, setExpandedParents] = useState({});
  const dropdownRef = useRef(null);

  const getSelectedColor = () => {
    for (const parent of colors) {
      if (parent.id === value) {
        return { name: parent.color_name, color: parent.color_code };
      }
      if (parent.children) {
        const child = parent.children.find((c) => c.id === value);
        if (child) {
          return {
            name: child.color_name,
            color: child.color_code || parent.color_code,
          };
        }
      }
    }
    return null;
  };

  const selectedColor = getSelectedColor();

  const filteredColors = colors
    .map((parent) => ({
      ...parent,
      children: parent.children?.filter((child) =>
        child.color_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(
      (parent) =>
        parent.color_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (parent.children && parent.children.length > 0)
    );

  useEffect(() => {
    if (searchTerm) {
      const expanded = {};
      filteredColors.forEach((parent) => {
        if (parent.children && parent.children.length > 0) {
          expanded[parent.id] = true;
        }
      });
      setExpandedParents(expanded);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleParent = (parentId, e) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const handleSelect = (colorId) => {
    onChange(colorId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          disabled={readOnly}
          className={`relative w-full px-3 py-2 text-left border rounded text-sm focus:outline-none transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          } ${
            readOnly
              ? "bg-gray-100 cursor-not-allowed opacity-70"
              : "bg-white hover:border-gray-400"
          } ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
        >
          <div className="flex items-center gap-2">
            {selectedColor && (
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: selectedColor.color }}
              />
            )}
            <span className={selectedColor ? "text-gray-900" : "text-gray-400"}>
              {selectedColor ? selectedColor.name : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !readOnly && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Box */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search colors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredColors.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No colors found
                </div>
              ) : (
                filteredColors.map((parent) => (
                  <div key={parent.id}>
                    {/* Parent Option - Acts as expandable group header */}
                    <div
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                      onClick={(e) => toggleParent(parent.id, e)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {parent.children && parent.children.length > 0 && (
                          <ChevronRight
                            className={`w-3 h-3 text-gray-400 transition-transform ${
                              expandedParents[parent.id] ? "rotate-90" : ""
                            }`}
                          />
                        )}
                        {!parent.children?.length && (
                          <div className="w-3 h-3" />
                        )}
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: parent.color_code }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {parent.color_name}
                        </span>
                      </div>
                      {parent.mill && (
                        <span className="text-xs text-gray-500">
                          {parent.mill}
                        </span>
                      )}
                    </div>

                    {/* Child Options - Only shown when parent is expanded */}
                    {expandedParents[parent.id] &&
                      parent.children &&
                      parent.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleSelect(child.id)}
                          className={`w-full text-left pl-9 pr-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${
                            value === child.id
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{
                                backgroundColor:
                                  child.color_code || parent.color_code,
                              }}
                            />
                            <span>{child.color_name}</span>
                          </div>
                          {child.type && (
                            <span className="text-xs text-gray-500 uppercase">
                              {child.type}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};
export default CustomColorDropdown;
