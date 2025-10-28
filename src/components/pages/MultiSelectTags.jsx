import { useState } from "react";

const MultiSelectTags = ({ routes, value = [], onChange }) => {
  const [open, setOpen] = useState(false);

  // Sync selected route objects based on route_id
  const selectedRoutes = value
    .map((v) => routes.find((r) => r.id === v.route_id))
    .filter(Boolean);

  const toggleSelect = (route) => {
    if (value.some((v) => v.route_id === route.id)) {
      // Remove if already selected
      onChange(value.filter((v) => v.route_id !== route.id));
    } else {
      // Add new
      onChange([...value, { route_id: route.id }]);
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div
        className="flex flex-wrap items-center gap-1 border rounded-lg px-2 py-1 cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        {selectedRoutes.length > 0 ? (
          selectedRoutes.map((route) => (
            <span
              key={route?.id}
              className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs"
            >
              {route?.route_name}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">Select...</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {routes.map((route) => (
            <div
              key={route?.id}
              onClick={() => toggleSelect(route)}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                value.some((v) => v.route_id === route?.id)
                  ? "bg-indigo-50 text-indigo-700"
                  : ""
              }`}
            >
              {route?.route_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectTags;
