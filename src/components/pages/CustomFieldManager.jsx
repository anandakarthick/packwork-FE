import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
// import { customFieldService } from '../../services/customFieldService';

const CustomFieldManager = ({ 
  isOpen, 
  onClose, 
  onFieldAdded, 
  fieldType = 'payment_terms', 
  title = 'Manage Custom Fields',
  description = 'Add and manage your custom field options',
  onRefresh 
}) => {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ value: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [deletingField, setDeletingField] = useState(null);
  const [currentDefaultField, setCurrentDefaultField] = useState(null);

  // Configuration based on field type
  const getFieldConfig = () => {
    switch(fieldType) {
      case 'payment_terms':
        return {
          modelName: 'Supplier',
          fieldName: 'custom_payment_terms',
          title: 'Manage Payment Terms',
          description: 'Add and manage your custom payment terms options',
          placeholder: 'Enter payment terms (e.g., Net 30, COD, etc.)',
          apiEndpoint: 'supplier-payment-terms'
        };
      case 'supplier_type':
        return {
          modelName: 'Supplier', 
          fieldName: 'custom_supplier_type',
          title: 'Manage Supplier Types',
          description: 'Add and manage your custom supplier type options',
          placeholder: 'Enter supplier type (e.g., Preferred, Strategic, etc.)',
          apiEndpoint: 'supplier-types'
        };
      case 'business_type':
        return {
          modelName: 'Supplier',
          fieldName: 'custom_business_type',
          title: 'Manage Business Types',
          description: 'Add and manage your custom business type options',
          placeholder: 'Enter business type (e.g., Trading, Manufacturing, etc.)',
          apiEndpoint: 'supplier-business-types'
        };
      default:
        return {
          modelName: 'Generic',
          fieldName: 'custom_field',
          title: 'Manage Custom Fields',
          description: 'Add and manage your custom field options',
          placeholder: 'Enter field value',
          apiEndpoint: 'custom-fields'
        };
    }
  };

  const config = getFieldConfig();

  useEffect(() => {
    if (isOpen) {
      fetchCustomFields();
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, fieldType]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  const fetchCustomFields = async () => {
    // try {
    //   setLoading(true);
    //   console.log(`🔄 Fetching custom ${fieldType}...`);
      
    //   const response = await customFieldService.getCustomFieldsByType(config.apiEndpoint);
      
    //   if (response.success) {
    //     setCustomFields(response.data || []);
    //     console.log(`✅ Loaded custom ${fieldType}:`, response.data);
    //     await loadCurrentDefault();
    //   } else {
    //     console.log(`⚠️ No custom ${fieldType} found:`, response.message);
    //     setCustomFields([]);
    //   }
    // } catch (error) {
    //   console.error(`❌ Error fetching custom ${fieldType}:`, error);
    //   toast.error(`Failed to load custom ${fieldType}`);
    //   setCustomFields([]);
    // } finally {
    //   setLoading(false);
    // }
    console.log(`Fetch custom fields for - function not implemented`);
  };

  const loadCurrentDefault = async () => {
    // try {
    //   const defaultField = customFieldService.getPreferredDefaultByType(config.apiEndpoint);
    //   setCurrentDefaultField(defaultField);
    // } catch (error) {
    //   console.warn('No default field found:', error);
    //   setCurrentDefaultField(null);
    // }
    console.log(`Load current default for - function not implemented`);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.value.trim()) {
      errors.value = `${fieldType.replace('_', ' ')} name is required`;
    } else {
      const duplicateExists = customFields.some(field => 
        field.value.toLowerCase() === formData.value.trim().toLowerCase() &&
        (!editingField || field.id !== editingField.id)
      );
      
      if (duplicateExists) {
        errors.value = 'This option already exists';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    console.log(`Submit form for - function not implemented`);
    // setFormLoading(true);
    // try {
    //   const submitData = {
    //     name: formData.value.trim(),
    //     sort_order: customFields.length + 1
    //   };
      
    //   let response;
    //   if (editingField) {
    //     // Update existing field
    //     response = await customFieldService.updateCustomFieldByType(config.apiEndpoint, editingField.id, submitData);
    //     toast.success(`${fieldType.replace('_', ' ')} "${submitData.name}" updated successfully!`);
    //   } else {
    //     // Create new field
    //     response = await customFieldService.createCustomFieldByType(config.apiEndpoint, submitData);
    //     toast.success(`${fieldType.replace('_', ' ')} "${submitData.name}" created successfully!`);
    //   }

    //   if (response.success) {
    //     await fetchCustomFields();
        
    //     if (onFieldAdded && !editingField) {
    //       onFieldAdded({
    //         id: response.data.id,
    //         name: submitData.name,
    //         value: submitData.name,
    //         type: 'custom',
    //         isCustom: true
    //       });
    //     }
        
    //     // Reset form
    //     setFormData({ value: '' });
    //     setFormErrors({});
    //     setEditingField(null);
    //   }
    // } catch (error) {
    //   console.error(`Error saving ${fieldType}:`, error);
    //   toast.error(error.response?.data?.message || `Failed to ${editingField ? 'update' : 'create'} ${fieldType.replace('_', ' ')}`);
    // } finally {
    //   setFormLoading(false);
    // }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({ value: field.value });
    
    // Scroll to top to show the form
    const modalContent = document.querySelector('.custom-field-modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFormData({ value: '' });
    setFormErrors({});
  };

  const handleDelete = async (field) => {
    if (!window.confirm(`Are you sure you want to delete "${field.value}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    console.log(`Delete field for - function not implemented`);
    // setDeletingField(field.id);
    // try {
    //   const response = await customFieldService.deleteCustomFieldByType(config.apiEndpoint, field.id);
      
    //   if (response.success) {
    //     toast.success(`${fieldType.replace('_', ' ')} "${field.value}" deleted successfully!`);
    //     await fetchCustomFields();
    //   } else {
    //     toast.error(response.message || `Failed to delete ${fieldType.replace('_', ' ')}`);
    //   }
    // } catch (error) {
    //   console.error(`Error deleting ${fieldType}:`, error);
    //   toast.error(`Failed to delete ${fieldType.replace('_', ' ')}`);
    // } finally {
    //   setDeletingField(null);
    // }
  };

  const handleSetAsDefault = async (customField) => {
    console.log(`Set as default for - function not implemented`);
    // try {
    //   console.log(`🔄 Setting custom ${fieldType} as default:`, customField.value);

    //   const response = await customFieldService.setDefaultCustomFieldByType(config.apiEndpoint, customField);

    //   if (response.success) {
    //     toast.success(`"${customField.value}" set as your default ${fieldType.replace('_', ' ')}!`);
    //     console.log(`✅ Custom ${fieldType} set as default`);

    //     setCurrentDefaultField(customField);

    //     if (onRefresh) {
    //       onRefresh();
    //     }
    //   } else {
    //     toast.error(response.message || `Failed to set default ${fieldType.replace('_', ' ')}`);
    //   }
    // } catch (error) {
    //   console.error(`❌ Error setting default ${fieldType}:`, error);
    //   toast.error(`Failed to set default ${fieldType.replace('_', ' ')}`);
    // }
  };

  const isCurrentDefault = (field) => {
    return currentDefaultField && 
           ((currentDefaultField.id && field.id === currentDefaultField.id) ||
            (currentDefaultField.value && field.value === currentDefaultField.value));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-15 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header - Matching AddCustomer modal header exactly */}
        <div
          className="flex items-center justify-between p-6 text-white rounded-t-xl"
          style={{ background: "linear-gradient(to right, #b36735, #a05d30)" }}
        >
          <div>
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {config.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Matching AddCustomer modal content structure */}
        <div className="flex-1 overflow-auto p-6 custom-field-modal-content">
          {/* Add Form - Matching TypeForm component styling */}
          <form className="flex gap-3 mb-6">
            <div className="flex-1">
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleFormChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleFormSubmit();
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  formErrors.value ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ ...(formErrors.value ? {} : { '--tw-ring-color': '#b36735' }) }}
                placeholder={editingField ? "Edit name" : config.placeholder}
                disabled={formLoading}
              />
              {formErrors.value && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formErrors.value}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-6 py-3 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              style={{ backgroundColor: '#b36735' }}
              onMouseEnter={(e) => { if (!formLoading) e.target.style.backgroundColor = '#a05d30'; }}
              onMouseLeave={(e) => { if (!formLoading) e.target.style.backgroundColor = '#b36735'; }}
              disabled={formLoading}
            >
              {formLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {formLoading ? (editingField ? 'Updating...' : 'Adding...') : (editingField ? 'Update' : 'Add')}
            </button>

            {editingField && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formLoading}
              >
                Cancel Edit
              </button>
            )}
          </form>

          {/* List - Matching TypeList component styling */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#b36735' }}></div>
                <p className="text-gray-600">Loading custom {fieldType.replace('_', ' ')}...</p>
              </div>
            ) : customFields.length > 0 ? (
              customFields.map((field) => (
                <div
                  key={field.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    editingField?.id === field.id 
                      ? "border-gray-200 hover:bg-gray-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  style={
                    editingField?.id === field.id
                      ? { borderColor: '#b36735', backgroundColor: 'rgba(179, 103, 53, 0.05)' }
                      : {}
                  }
                >
                  <div className="flex items-center flex-1">
                    <span className="font-medium text-gray-900">{field.value}</span>
                    {isCurrentDefault(field) && (
                      <span className="ml-3 px-2 py-1 text-xs text-green-600 bg-green-100 rounded-full font-medium">
                        Default
                      </span>
                    )}
                    {editingField?.id === field.id && (
                      <span
                        className="ml-3 px-2 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: "rgba(179, 103, 53, 0.1)", color: '#b36735' }}
                      >
                        Editing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCurrentDefault(field) && (
                      <button
                        onClick={() => handleSetAsDefault(field)}
                        className="px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-medium rounded-full transition-colors border border-blue-200"
                        title="Set as default"
                        disabled={formLoading}
                      >
                        Set Default
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      type="button"
                      className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      onClick={() => handleEdit(field)}
                      disabled={deletingField === field.id}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDelete(field)}
                      disabled={deletingField === field.id || editingField?.id === field.id}
                    >
                      {deletingField === field.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-sm font-medium text-gray-900 mb-1">No items found</h3>
                <p className="text-sm text-gray-500">Click "Add" to create your first {fieldType.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Matching AddCustomer modal footer structure */}
        <div className="border-t bg-white rounded-b-xl p-4 sticky bottom-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={formLoading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CustomFieldManager;