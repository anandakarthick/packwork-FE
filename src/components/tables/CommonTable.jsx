import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

const CommonTable = ({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
  onView,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-2xl">
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : data.length === 0 ? (
        <div className="p-4 text-center">{emptyMessage}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}

              {showActions && (
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onView(row)}
                className="hover: cursor-pointer hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 text-sm">
                    {col.render ? (
                      col.render(row) // ✅ if render callback is defined
                    ) : col.key === "status" ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          row.is_active
                            ? "bg-success-100 text-success-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {row.is_active ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}

                {showActions && (
                  <td className="px-4 py-2 text-center">
                    <div className="flex space-x-2 justify-center">
                      {onView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(row);
                          }}
                          className="p-2 text-corrugated-600 hover:text-corrugated-800 hover:bg-corrugated-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="p-2 text-danger-600 hover:text-danger-800 hover:bg-danger-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommonTable;
