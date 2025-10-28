import { FileText, Trash2, Upload } from "lucide-react";

const DocumentsUpload = ({
  documents = [],
  handleUpload = () => {},
  onRemove = () => {},
  title = "Print Documents",
  maxFiles = 10,
}) => {
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
      e.target.value = "";
    }
  };

  return (
    <div className="card-corrugated p-4 flex flex-col mt-4">
      {/* Section Header */}
      <div className="mb-4 pb-2 border-b border-manufacturing-200">
        <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
          <div className="bg-primary-100 rounded-full p-1 mr-2">
            <FileText className="h-3 w-3 text-primary-600" />
          </div>
          {title}
        </h3>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
          handleUpload(Array.from(e.dataTransfer.files || []));
        }}
      >
        <div className="space-y-2">
          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <label htmlFor="documents-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Upload {title.toLowerCase()}
              </span>
              <input
                id="documents-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
                className="sr-only"
              />
            </label>
            <span className="text-sm text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500">
            PDF, JPG, PNG, WEBP up to 10MB each (max {maxFiles} files)
          </p>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-3 mt-4">
          {documents.map((document) => (
            <div
              key={
                document.id || `${document.name}-${document.size}-${Date.now()}`
              }
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {document.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(document.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(document.id)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Remove document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsUpload;
