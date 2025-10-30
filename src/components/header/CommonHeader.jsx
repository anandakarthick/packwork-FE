import { Search, Plus, Upload, Download, Filter, XCircle } from "lucide-react";

const CommonHeader = ({
  title,
  subtitle,
  searchTerm,
  onSearch,
  searchPlaceholder = "Search...",
  onAdd,
  statusFilter,
  handleStatusFilter,
  onClearFilters, // ✅ clear handler
  onImport = () => {},
  onExport = () => {},
  addButtonText = "Add",
  showAddButton = true,
}) => {
  const showClearButton = searchTerm !== "" || statusFilter !== ""; // ✅ condition check

  return (
    <div className="mb-4">
      {/* Header title + add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-manufacturing-800 flex items-center">
            {title}
          </h1>
          {subtitle && (
            <p className="text-manufacturing-600 mt-1 text-sm">{subtitle}</p>
          )}
        </div>

        {showAddButton && (
          <button
            onClick={onAdd}
            className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl items-center transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 text-sm"
          >
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-1 mr-2">
                <Plus className="h-4 w-4" />
              </div>
              <span>{addButtonText}</span>
            </div>
          </button>
        )}
      </div>

      {/* Search bar and buttons */}
      <div className="card-corrugated p-4 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* 🔍 Search + Filter on the left */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-manufacturing-400 h-4 w-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={onSearch}
                className="w-full pl-10 pr-4 py-2 text-sm border border-manufacturing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative sm:w-44">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-manufacturing-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full pl-10 pr-8 py-2 text-sm border border-manufacturing-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* ✅ Clear Button - only shown when active filters */}
            {showClearButton && (
              <button
                onClick={onClearFilters}
                className="flex items-center px-3 py-2 text-sm text-manufacturing-600 border border-manufacturing-300 rounded-lg hover:bg-manufacturing-50 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                Clear
              </button>
            )}
          </div>

          {/* ⚙️ Action Buttons on the right */}
          <div className="flex gap-2 justify-end">
            {showAddButton && (
              <button
                onClick={onAdd}
                className="sm:hidden px-3 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            )}

            {/* <button
              onClick={onImport}
              className="px-4 py-2.5 text-manufacturing-600 border border-manufacturing-300 rounded-lg hover:bg-manufacturing-50 transition-colors font-medium flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button> */}

            {/* <button
              onClick={onExport}
              className="px-4 py-2.5 text-manufacturing-600 border border-manufacturing-300 rounded-lg hover:bg-manufacturing-50 transition-colors font-medium flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonHeader;
