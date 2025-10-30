import {
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Currency,
  Edit3,
  File,
  Globe,
  Hash,
  InfoIcon,
  LocationEditIcon,
  Mail,
  Phone,
  PhoneCall,
  Settings,
  Truck,
  TruckIcon,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProcessService from "../../services/ProcessServices";

const ViewProcess = () => {
  const navigate = useNavigate();
  const [process, setProcess] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const { id } = useParams();
  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const response = await ProcessService.getProcessById(id);
        console.log("process response:", response);

        const customFields = await ProcessService.getProcessCustomFields(id);
        console.log("custom fields response:", customFields?.data);

        const processData = {
          ...response?.data,
          customFields: customFields?.data || [],
        };

        setProcess(processData);
      } catch (error) {
        console.error("Error fetching process:", error);
      }
    };

    if (id) {
      fetchProcess();
    }
  }, [id]);

  return (
    <div>
      <div className="min-h-screen bg-corrugated-bg animate-slide-in-right">
        <div className="bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/process")}
                className="mr-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-1.5 mr-2">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">
                    {process?.process_name}
                  </h1>
                  <p className="text-corrugated-100 text-xs">
                    ID: {process?.process_number || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/edit-process/${process?.id}`)}
                className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium flex items-center text-sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => navigate("/process")}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            {/* Contact Information Card - Left Half */}
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <InfoIcon className="h-3 w-3 text-primary-600" />
                </div>
                Process Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                    Process Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={process?.process_name || ""}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 transition-colors`}
                    placeholder="Enter process name"
                  />
                </div>

                <div
                  className="w-full rounded-lg p-3 flex justify-between items-center"
                  style={{
                    backgroundColor: "#f7dec1",
                    border: "2px solid #f7dec1",
                  }}
                >
                  {" "}
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary-600" />
                    <div>
                      <h4 className="text-xs font-medium text-primary-800">
                        Process ID
                      </h4>
                      <p className="text-xs text-primary-600">Auto-generated</p>
                    </div>
                  </div>
                  <div className="text-base font-semibold text-primary-700 font-mono">
                    {id
                      ? process?.process_number || "N/A"
                      : "Will be generated"}
                  </div>
                </div>
                <div className="bg-success-50 border border-success-200 rounded-lg p-4 ">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-success-600 mr-2" />
                    <div>
                      <h4 className="text-xs font-medium text-success-800">
                        Custom Fields
                      </h4>
                      <p className="text-xs text-success-600">
                        {process.customFields?.length || 0} field
                        {process.customFields?.length !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-4 pb-2 border-b border-manufacturing-200 flex items-center">
                <div className="bg-primary-100 rounded-full p-1 mr-2">
                  <Currency className="h-3 w-3 text-primary-600" />
                </div>
                Custom Fields ({process.customFields?.length || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {process.customFields && process.customFields.length > 0 ? (
                  process.customFields.map((field, index) => (
                    <div key={index} className="card-corrugated p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Field Label
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm">
                            {field.field_label}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Field Type
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm">
                            {field.field_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Field Order
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm">
                            {field.field_order}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-manufacturing-500 capitalize">
                            Default Value
                          </p>
                          <p className="font-medium text-manufacturing-800 text-sm">
                            {field.default_value}
                          </p>
                        </div>
                      </div>
                      {field.field_type === "dropdown" && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(index)}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-800 mt-2"
                        >
                          <span className="text-sm font-medium">Options</span>
                          {expandedIndex === index ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {field.field_type === "dropdown" &&
                        expandedIndex === index && (
                          <div className="mt-3 border-t border-manufacturing-100 pt-3">
                            {(() => {
                              const dropdownOptions = Array.isArray(
                                field.dropdown_options
                              )
                                ? field.dropdown_options
                                : typeof field.dropdown_options === "string"
                                ? field.dropdown_options
                                    .split(",")
                                    .map((opt) => opt.trim())
                                : [];

                              return dropdownOptions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {dropdownOptions.map((opt, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs text-gray-700"
                                    >
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  No options available.
                                </p>
                              );
                            })()}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-manufacturing-500">
                    No custom fields found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProcess;
