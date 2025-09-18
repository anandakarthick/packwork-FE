import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductService } from "../../services/ProductServices";
import { ArrowLeft, Edit3, Truck, X } from "lucide-react";

const ViewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await ProductService.getById(id);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const renderFields = (data) => {
    if (!data) return null;

    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data)
          .filter(
            ([key]) =>
              ![
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
                "die_id",
                "stages"
              ].includes(key)
          )
          .filter(([, value]) => typeof value !== "object")
          .map(([key, value]) => (
            <div key={key}>
              <p className="text-xs text-manufacturing-500 capitalize">
                {key.replace(/_/g, " ")}
              </p>
              <p className="font-medium text-manufacturing-800 text-sm">
                {value ?? "Not provided"}
              </p>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-corrugated-bg animate-slide-in-right">
      <div className="bg-gradient-to-r from-corrugated-600 to-corrugated-700 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="mr-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-1.5 mr-2">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-medium">{product.product_name}</h1>
                <p className="text-corrugated-100 text-xs">
                  ID: {product.reference_number || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/edit-product/${product.id}`)}
              className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium flex items-center text-sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => navigate("/")}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-corrugated p-4 md:row-span-2">
            <h3 className="text-base font-medium text-manufacturing-800 mb-3 border-b pb-2">
              Product Details
            </h3>
            {renderFields(product)}
          </div>

          {product.ProductVersions?.length > 0 && (
            <div className="card-corrugated p-4">
              <h3 className="text-base font-medium text-manufacturing-800 mb-3 border-b pb-2">
                {product.ProductVersions[0].version_name}
              </h3>
              {renderFields(product.ProductVersions[0])}
            </div>
          )}

          <div className="space-y-4">
            {product.ProductVersions?.[0]?.WireSpecification && (
              <div className="card-corrugated p-4">
                <h3 className="text-base font-medium text-manufacturing-800 mb-3 border-b pb-2">
                  Wire Specification
                </h3>
                {renderFields(product.ProductVersions[0].WireSpecification)}
              </div>
            )}

            {product.ProductVersions?.[0]?.GlueSpecification && (
              <div className="card-corrugated p-4">
                <h3 className="text-base font-medium text-manufacturing-800 mb-3 border-b pb-2">
                  Glue Specification
                </h3>
                {renderFields(product.ProductVersions[0].GlueSpecification)}
              </div>
            )}

            {(product.ProductVersions?.[0]?.ReelSpecification ||
              product.ProductVersions?.[0]?.LayerSpecifications?.length >
                0) && (
              <div className="card-corrugated p-4">
                <h3 className="text-base font-medium text-manufacturing-800 mb-3 border-b pb-2">
                  Reel & Layer Specifications
                </h3>
                {product.ProductVersions?.[0]?.ReelSpecification &&
                  renderFields(product.ProductVersions[0].ReelSpecification)}

                <div className="mt-2">
                  {product.ProductVersions?.[0]?.LayerSpecifications?.length >
                    0 &&
                    product.ProductVersions[0].LayerSpecifications.map(
                      (layer, index) => (
                        <span key={index}>{renderFields(layer)}</span>
                      )
                    )}
                </div>
              </div>
            )}

            {product.ProductVersions?.[0]?.ProductDieSpecification?.length >
              0 && (
              <div className="card-corrugated p-4">
                <h3 className="text-base font-medium text-manufacturing-800 mb-3 border-b pb-2">
                  Die Specification
                </h3>
                {product.ProductVersions[0].ProductDieSpecification.map(
                  (dieSpec, index) => (
                    <div
                      key={index}
                      className="mb-3 pb-3 border-b last:border-b-0 last:pb-0"
                    >
                      {renderFields(dieSpec)}

                      {dieSpec.DieSpecification && (
                        <div className="mt-2">
                          {renderFields(dieSpec.DieSpecification)}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
