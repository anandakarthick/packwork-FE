import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductService } from "../../services/ProductServices";
import { ArrowLeft, Edit3, Truck, X } from "lucide-react";

const ViewSku = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [skuData, setSkuData] = useState({});

  useEffect(() => {
    const fetchSKU = async () => {
      try {
        const response = await ProductService.getById(id);
        setSkuData(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchSKU();
  }, [id]);

  const renderFields = (data, excludeKeys = []) => {
    if (!data) return null;

    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data)
          .filter(([key]) => !excludeKeys.includes(key))
          .filter(([, value]) => typeof value !== "object")
          .map(([key, value]) => (
            <div key={key}>
              <p className="text-xs text-gray-500 capitalize">
                {key.replace(/_/g, " ")}
              </p>
              <p className="font-medium text-gray-800 text-sm">
                {value ?? "Not provided"}
              </p>
            </div>
          ))}
      </div>
    );
  };

  const productVersion = skuData.ProductVersions?.[0] || {};
  const boardSpec = productVersion.BoardSpecification || {};
  const layerSpecs = (productVersion.LayerSpecifications || []).sort(
    (a, b) => a.layer_id - b.layer_id
  );
  const dieSpec =
    productVersion.ProductDieSpecification?.[0]?.DieSpecification || {};
  const dieLayouts = productVersion.ProductDieSpecification || [];
  const productPieces = productVersion.ProductPieces || [];

  const totalWeight = layerSpecs.reduce((sum, l) => sum + (l.weight || 0), 0);
  const totalBurstingStrength = layerSpecs.reduce(
    (sum, l) => sum + (l.bursting_strength || 0),
    0
  );

  return (
    <div className="min-h-screen bg-corrugated-bg animate-slide-in-right">
      <div className="bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/sku")}
              className="mr-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-1.5 mr-2">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-medium">{skuData.product_name}</h1>
                <p className="text-corrugated-100 text-xs">
                  ID: {skuData.reference_number || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/edit-sku/${skuData.id}`)}
              className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium flex items-center text-sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => navigate("/sku")}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-corrugated p-4 md:row-span-2">
          <h3 className="text-base font-medium text-gray-800 mb-3 border-b pb-2">
            Product Details
          </h3>
          {renderFields(skuData, [
            "id",
            "product_id",
            "product_version_id",
            "company_id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "deleted_at",
            "is_active",
            "status",
            "is_deleted",
            "stages",
          ])}
        </div>

        {boardSpec && Object.keys(boardSpec).length > 0 && (
          <div className="card-corrugated p-4">
            <h3 className="text-base font-medium text-gray-800 mb-3 border-b pb-2">
              Board Specification
            </h3>
            {renderFields(boardSpec, [
              "id",
              "product_version_id",
              "company_id",
              "created_by",
              "updated_by",
              "created_at",
              "updated_at",
              "is_active",
              "strict_adherence",
            ])}
          </div>
        )}

        {/* Die-Cut Specification */}
        {dieSpec && Object.keys(dieSpec).length > 0 && (
          <div className="card-corrugated p-4">
            <h3 className="text-base font-medium text-gray-800 mb-3 border-b pb-2">
              Die-Cut Specification
            </h3>
            {renderFields(dieSpec, [
              "id",
              "product_version_id",
              "company_id",
              "created_by",
              "updated_by",
              "created_at",
              "updated_at",
              "is_active",
            ])}
          </div>
        )}

        {/* Die SKU Layouts - Separate Card */}
        {productPieces.length > 0 && (
          <div className="card-corrugated p-4">
            <h3 className="text-base font-medium text-gray-800 mb-3 border-b pb-2">
              Die SKU Layouts
            </h3>
            <table className="min-w-full divide-y divide-gray-200 mb-4 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left font-medium">SKU</th>
                  <th className="px-2 py-2 text-left font-medium">UPS</th>
                  <th className="px-2 py-2 text-left font-medium">Weight</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productPieces.map((layout) => (
                  <tr key={layout.id}>
                    <td className="px-2 py-2">{layout.piece_product_parts}</td>
                    <td className="px-2 py-2">{layout.ups}</td>
                    <td className="px-2 py-2">{layout.weight ?? "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {layerSpecs.length > 0 && (
          <div className="card-corrugated p-4 md:col-span-2">
            <h3 className="text-base font-medium text-gray-800 mb-3 border-b pb-2">
              Layer Specifications
            </h3>
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Layer
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    colSpan="3"
                  >
                    GSM / BF / COLOR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flute Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (KG)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bursting Strength (KG/CM²)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {layerSpecs.map((layer, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                      {layer.layer_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600" colSpan="3">
                      {layer.gsm} / {layer.bf} / {layer.color_id ?? "--"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {layer.flute_type ?? "--"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-green-600">
                      {layer.weight ? layer.weight.toFixed(3) : "0.000"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-blue-600">
                      {layer.bursting_strength
                        ? layer.bursting_strength.toFixed(3)
                        : "0.000"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end space-x-8 text-sm font-medium mt-4">
              <p>
                Total Weight:{" "}
                <span className="text-green-600">
                  {totalWeight.toFixed(3)} KG
                </span>
              </p>
              <p>
                Total Bursting Strength:{" "}
                <span className="text-blue-600">
                  {totalBurstingStrength.toFixed(3)} KG/CM²
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSku;
