const Pagination = ({ pagination, filters, setFilters }) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  if (!pagination.total) return null;

  return (
    <div>
      {/* {pagination.pages > 1 && ( */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-manufacturing-200 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="relative inline-flex items-center px-4 py-2 border border-manufacturing-300 text-sm font-medium rounded-md text-manufacturing-700 bg-white hover:bg-manufacturing-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-manufacturing-300 text-sm font-medium rounded-md text-manufacturing-700 bg-white hover:bg-manufacturing-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-manufacturing-700">
                Showing {(pagination.current - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.current * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-manufacturing-300 bg-white text-sm font-medium text-manufacturing-500 hover:bg-manufacturing-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.current === page
                            ? "z-10 bg-corrugated-50 border-corrugated-500 text-corrugated-600"
                            : "bg-white border-manufacturing-300 text-manufacturing-500 hover:bg-manufacturing-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-manufacturing-300 bg-white text-sm font-medium text-manufacturing-500 hover:bg-manufacturing-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/* )} */}
    </div>
  );
};

export default Pagination;
