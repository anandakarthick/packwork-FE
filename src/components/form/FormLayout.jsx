import React from "react";
import { ArrowLeft, X, Save } from "lucide-react";

const FormLayout = ({
  title = "Form Title",
  subtitle = "",
  onCancel,
  onSubmit,
  loading = false,
  children,
  submitText = "Save",
}) => {
  // ✅ FIX: Properly handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(e);
  };

  return (
    <div className="flex flex-col h-screen bg-corrugated-bg animate-slide-in-right">
      <div className="bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white px-4 py-3 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-medium">{title}</h1>
              {subtitle && (
                <p className="text-corrugated-100 text-xs">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        <div className="bg-white border-t border-manufacturing-200 p-4 sticky bottom-0 z-10">
          <div className="flex justify-end space-x-3 mx-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-manufacturing-600 border border-manufacturing-300 rounded-lg hover:bg-manufacturing-50 transition-colors font-medium text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white rounded-lg hover:from-corrugated-700 hover:to-corrugated-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              <Save className="h-4 w-4 mr-2" />
              {submitText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormLayout;