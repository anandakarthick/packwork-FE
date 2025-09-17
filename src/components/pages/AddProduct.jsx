import FormLayout from "../form/FormLayout";
import { useNavigate } from "react-router-dom";

const AddSupplierForm = () => {

  const navigate = useNavigate();
  const handleCancel = () => navigate('/');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit");
  };

  return (
    <FormLayout
      title="Add New Product"
      subtitle="Create a new product record"
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      loading={false}
      submitText="Create Product"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500"
            placeholder="Enter product name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-manufacturing-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500"
            placeholder="supplier@example.com"
          />
        </div>
      </div>
    </FormLayout>
  );
};

export default AddSupplierForm;
