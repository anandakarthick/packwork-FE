import { useEffect, useState } from "react";
import FormLayout from "../form/FormLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { Truck } from "lucide-react";
import toast from "react-hot-toast";
import { ProductService } from "../../services/ProductServices";
import LayerConfiguration from "./LayerConfiguration";
import BoardInformation from "./BoardInformation";
import DieInformation from "./DieInformation";

const AddSku = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const plyOptions = ["2", "3", "5", "7", "9"];
  const fluteTypes = ["A", "B", "C"];
  const [helperBoard, setHelperBoard] = useState(0);
  const [calculatedDeckleSize, setCalculatedDeckleSize] = useState(null);
  const [fluteDetails, setFluteDetails] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [isStrictAdherence, setIsStrictAdherence] = useState(false);
  const [dieProducts, setDieProducts] = useState([]);

  const MM_TO_INCH = 0.039370078740157;
  const INCH_TO_MM = 25.4;
  const MM_TO_CM = 0.1;
  const CM_TO_MM = 10;

  const [originalMmValues, setOriginalMmValues] = useState({
    dimensions: { length: "", width: "", height: "" },
    joints: "",
    deckle_size: "",
    flap_width: "",
    board_size: { width: "", length: "" },
    ups: "",
    length_trimming_tolerance: "",
    width_trimming_tolerance: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      product_name: "",
      reference_number: "",
      client_reference_code: "",
      category: "SKU",
      manufacturer: "",
      subcategory: "",
      status: "active",
      company_id: "comp-123",
      created_by: "user-001",
      die_specifications: {
        die_id: "",
        board_length: "",
        board_width: "",
        impressions: "",
        blank_length: "",
        blank_width: "",
        ups_length: "",
        ups_width: "",
        total_blanks: "",
        ups: "",
      },
      board_specifications: {
        units: "mm",
        box_length: "",
        box_width: "",
        box_height: "",
        joints: "",
        deckle_size: "",
        inner_outer_dimension: "",
        flap_width: "",
        board_length: "",
        board_width: "",
        board_length_cm: "",
        board_width_cm: "",
        ups: "",
        board_width_per_up: 60,
        length_trimming_tolerance: "",
        width_trimming_tolerance: "",
        ply: "2",
        strict_adherence: false,
      },
      layer_specifications: [
        {
          layer_id: 0,
          layer_name: "",
          gsm: "",
          bf: "",
          flute_type: "",
          color_id: "",
          weight: "",
          bursting_strength: "",
        },
      ],
    },
  });

  const selectedPly = watch("board_specifications.ply");
  const boardSpecs = watch("board_specifications");
  const layers = watch("layer_specifications");
  const selectedSubcategory = watch("subcategory");

  useEffect(() => {
    if (selectedSubcategory === "Die") {
      const fetchDieProducts = async () => {
        console.log("inside the fetch die products");
        const result = await ProductService.getDieProducts({
          categoryFilter: "sku",
        });
        console.log("Products Die:", result);
        setDieProducts(result?.data?.products);
      };
      fetchDieProducts();
    }
  }, [selectedSubcategory]);

  useEffect(() => {
    if (!selectedPly) setValue("board_specifications.ply", plyOptions[0]);
  }, [selectedPly, setValue]);

  useEffect(() => {
    setFluteDetails([
      { name: "A", take_up_factor: 1.5 },
      { name: "B", take_up_factor: 1.3 },
      { name: "C", take_up_factor: 1.4 },
    ]);
  }, []);

  const { fields, replace } = useFieldArray({
    control,
    name: "layer_specifications",
  });

  const generateLayerNames = (plyCount) => {
    const ply = parseInt(plyCount, 10) || 2;
    if (ply <= 2) return ["Corrugation Layer", "Liner Layer"];

    const names = ["Top Layer"];
    let i = 1;

    while (names.length < ply) {
      names.push(`Corrugation Layer ${i}`);
      if (names.length >= ply) break;
      names.push(`Liner Layer ${i}`);
      i++;
    }
    return names;
  };

  const isCorrugationLayer = (layerName) => {
    return layerName && layerName.toLowerCase().includes("corrugation");
  };

  const ply = watch("board_specifications.ply");

  useEffect(() => {
    const plyInt = parseInt(ply, 10) || 2;
    const layerNames = generateLayerNames(plyInt);
    const currentLayers = getValues("layer_specifications") || [];

    const newLayers = Array.from({ length: plyInt }, (_, index) => {
      const existing = currentLayers[index] || {};

      return {
        id: existing.id,

        layer_id: existing.layer_id ?? index + 1,

        layer_name:
          layerNames[index] ?? existing.layer_name ?? `Layer ${index + 1}`,

        gsm: existing.gsm ?? "",
        bf: existing.bf ?? "",
        color_id: existing.color_id ?? existing.color ?? "",
        flute_type: existing.flute_type ?? existing.flute ?? "",
        weight: existing.weight ?? 0,
        bursting_strength: existing.bursting_strength ?? 0,
      };
    });

    const needsReplace =
      currentLayers.length !== newLayers.length ||
      newLayers.some((nl, i) => {
        const cur = currentLayers[i] || {};

        return (
          String(cur.gsm ?? "") !== String(nl.gsm ?? "") ||
          String(cur.bf ?? "") !== String(nl.bf ?? "") ||
          String(cur.color_id ?? cur.color ?? "") !==
            String(nl.color_id ?? "") ||
          String(cur.flute_type ?? cur.flute ?? "") !==
            String(nl.flute_type ?? "") ||
          String(cur.layer_name ?? "") !== String(nl.layer_name ?? "")
        );
      });

    if (needsReplace) {
      replace(newLayers);
    }
  }, [ply, replace, getValues]);

  const calculateBoardSize = (data) => {
    const length = parseFloat(data.box_length) || 0;
    const width = parseFloat(data.box_width) || 0;
    const height = parseFloat(data.box_height) || 0;
    const lengthTrimmingTolerance =
      parseFloat(data.length_trimming_tolerance) || 0;
    const widthTrimmingTolerance =
      parseFloat(data.width_trimming_tolerance) || 0;
    const upsval = parseFloat(data.ups) || 0;
    const flapWidth = parseFloat(data.flap_width) || 0;

    const lengthBoardSize =
      (length + width) * 2 + lengthTrimmingTolerance + flapWidth;
    const widthBoardSize = (width + height) * upsval + widthTrimmingTolerance;
    const widthBoardSizeHelper = (width + height) * 1 + widthTrimmingTolerance;

    setHelperBoard(widthBoardSizeHelper);
    const calculatedDeckleSize = widthBoardSize || null;
    setCalculatedDeckleSize(calculatedDeckleSize);

    return {
      length_board_size: Number(lengthBoardSize.toFixed(2)),
      width_board_size: Number(widthBoardSize.toFixed(2)),
      calculated_deckle_size: calculatedDeckleSize,
      ups: Number(upsval.toFixed()),
    };
  };

  const calculateLayerWeight = (gsm, layerName, fluteType = "") => {
    const deckleSize = parseFloat(boardSpecs?.deckle_size) || 0;
    const boardLength = parseFloat(boardSpecs?.board_length) || 0;
    const gsmValue = parseFloat(gsm) || 0;

    if (deckleSize === 0 || boardLength === 0 || gsmValue === 0) {
      return 0;
    }

    const isCorrugation = isCorrugationLayer(layerName);

    if (isCorrugation && fluteType) {
      const selectedFlute = fluteDetails.find(
        (flute) => flute.name === fluteType
      );
      const takeUpFactor = selectedFlute
        ? parseFloat(selectedFlute.take_up_factor) || 1
        : 1;
      return (deckleSize * boardLength * gsmValue * takeUpFactor) / 1000000000;
    } else {
      return (deckleSize * boardLength * gsmValue) / 1000000000;
    }
  };

  const calculateLayerBurstingStrength = (gsm, bf, layerName) => {
    const gsmValue = parseFloat(gsm) || 0;
    const bfValue = parseFloat(bf) || 0;

    if (gsmValue === 0 || bfValue === 0) {
      return 0;
    }

    const isCorrugated = isCorrugationLayer(layerName);
    const divisor = isCorrugated ? 2000 : 1000;
    return Number(((gsmValue * bfValue) / divisor).toFixed(3));
  };

  const convertFromMm = (mmValue, targetUnit) => {
    if (mmValue === "" || mmValue === null || typeof mmValue === "undefined")
      return "";
    const parsed = parseFloat(mmValue);
    if (isNaN(parsed)) return "";

    if (targetUnit === "mm") return Number(parsed.toFixed(2));
    if (targetUnit === "cm") return Number((parsed * MM_TO_CM).toFixed(2));
    if (targetUnit === "in") return Number((parsed * MM_TO_INCH).toFixed(2));
    return parsed;
  };

  const convertToMm = (value, fromUnit) => {
    if (!value || fromUnit === "mm") return value;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    if (fromUnit === "in") return numValue * INCH_TO_MM;
    if (fromUnit === "cm") return numValue * CM_TO_MM;
    return numValue;
  };

  const handleUnitChange = (newUnit) => {
    const currentValues = getValues("board_specifications");

    const boxLengthMm = convertToMm(
      currentValues.box_length,
      currentValues.units
    );
    const boxWidthMm = convertToMm(
      currentValues.box_width,
      currentValues.units
    );
    const boxHeightMm = convertToMm(
      currentValues.box_height,
      currentValues.units
    );
    const flapWidthMm = convertToMm(
      currentValues.flap_width,
      currentValues.units
    );
    const lengthTrimMm = convertToMm(
      currentValues.length_trimming_tolerance,
      currentValues.units
    );
    const widthTrimMm = convertToMm(
      currentValues.width_trimming_tolerance,
      currentValues.units
    );
    const jointsMm = convertToMm(currentValues.joints, currentValues.units);
    const upsMm = convertToMm(currentValues.ups, currentValues.units);
    const deckleMm = convertToMm(
      currentValues.deckle_size,
      currentValues.units
    );
    const boardLengthMm = convertToMm(
      currentValues.board_length,
      currentValues.units
    );
    const boardWidthMm = convertToMm(
      currentValues.board_width,
      currentValues.units
    );

    const convertedValues = {
      ...currentValues,
      units: newUnit,
      box_length: convertFromMm(boxLengthMm, newUnit),
      box_width: convertFromMm(boxWidthMm, newUnit),
      box_height: convertFromMm(boxHeightMm, newUnit),
      flap_width: convertFromMm(flapWidthMm, newUnit),
      length_trimming_tolerance: convertFromMm(lengthTrimMm, newUnit),
      width_trimming_tolerance: convertFromMm(widthTrimMm, newUnit),
      joints: convertFromMm(jointsMm, newUnit),
      ups: convertFromMm(upsMm, newUnit),
      deckle_size: convertFromMm(deckleMm, newUnit),
      board_length: convertFromMm(boardLengthMm, newUnit),
      board_width: convertFromMm(boardWidthMm, newUnit),
    };

    setValue("board_specifications", convertedValues, {
      shouldDirty: true,
      shouldValidate: false,
      shouldTouch: true,
    });

    setOriginalMmValues({
      ...originalMmValues,
      dimensions: {
        length: boxLengthMm?.toString() || "",
        width: boxWidthMm?.toString() || "",
        height: boxHeightMm?.toString() || "",
      },
      flap_width: flapWidthMm?.toString() || "",
      length_trimming_tolerance: lengthTrimMm?.toString() || "",
      width_trimming_tolerance: widthTrimMm?.toString() || "",
      joints: jointsMm?.toString() || "",
      ups: upsMm?.toString() || "",
      deckle_size: deckleMm?.toString() || "",
      board_size: {
        length: boardLengthMm?.toString() || "",
        width: boardWidthMm?.toString() || "",
      },
    });
  };

  const handleInputChange = (fieldPath, value) => {
    setValue(fieldPath, value);

    const mmValue = convertToMm(value, boardSpecs.units);
    const fieldName = fieldPath.split(".")[1];

    if (fieldName === "box_length") {
      setOriginalMmValues((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, length: mmValue.toString() },
      }));
    } else if (fieldName === "box_width") {
      setOriginalMmValues((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, width: mmValue.toString() },
      }));
    } else if (fieldName === "box_height") {
      setOriginalMmValues((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, height: mmValue.toString() },
      }));
    } else if (
      [
        "flap_width",
        "length_trimming_tolerance",
        "width_trimming_tolerance",
        "joints",
        "ups",
      ].includes(fieldName)
    ) {
      setOriginalMmValues((prev) => ({
        ...prev,
        [fieldName]: mmValue.toString(),
      }));
    }

    const boardSizeFields = [
      "box_length",
      "box_width",
      "box_height",
      "joints",
      "length_trimming_tolerance",
      "width_trimming_tolerance",
      "ups",
      "flap_width",
    ];

    if (boardSizeFields.includes(fieldName)) {
      const currentValues = getValues("board_specifications");
      const boardSizeUpdates = calculateBoardSize(currentValues);

      setValue(
        "board_specifications.board_length",
        boardSizeUpdates.length_board_size
      );
      setValue(
        "board_specifications.board_width",
        boardSizeUpdates.width_board_size
      );

      if (
        fieldName !== "deckle_size" &&
        boardSizeUpdates.width_board_size > 0
      ) {
        const deckleSizeInCurrentUnit = convertFromMm(
          boardSizeUpdates.width_board_size,
          boardSpecs.units
        );
        setValue("board_specifications.deckle_size", deckleSizeInCurrentUnit);
        setOriginalMmValues((prev) => ({
          ...prev,
          deckle_size: boardSizeUpdates.width_board_size.toString(),
        }));
      }

      setOriginalMmValues((prev) => ({
        ...prev,
        board_size: {
          width: boardSizeUpdates.width_board_size.toString(),
          length: boardSizeUpdates.length_board_size.toString(),
        },
      }));

      const currentLayers = getValues("layer_specifications");
      const updatedLayers = currentLayers.map((layer) => {
        const calculatedWeight = calculateLayerWeight(
          layer.gsm,
          layer.layer_name,
          layer.flute_type
        );
        const calculatedBS = calculateLayerBurstingStrength(
          layer.gsm,
          layer.bf,
          layer.layer_name
        );
        return {
          ...layer,
          weight: calculatedWeight,
          bursting_strength: calculatedBS,
        };
      });
      setValue("layer_specifications", updatedLayers);
    }
  };

  const updateLayer = (index, field, value) => {
    const currentLayers = getValues("layer_specifications");
    const updatedLayer = {
      ...currentLayers[index],
      [field]: value,
    };
    if (field === "gsm" || field === "flute_type") {
      const gsm = field === "gsm" ? value : updatedLayer.gsm;
      const fluteType =
        field === "flute_type" ? value : updatedLayer.flute_type;
      updatedLayer.weight = calculateLayerWeight(
        gsm,
        updatedLayer.layer_name,
        fluteType
      );
    }

    if (field === "gsm" || field === "bf") {
      const gsm = field === "gsm" ? value : updatedLayer.gsm;
      const bf = field === "bf" ? value : updatedLayer.bf;
      updatedLayer.bursting_strength = calculateLayerBurstingStrength(
        gsm,
        bf,
        updatedLayer.layer_name
      );
    }
    setValue(`layer_specifications.${index}`, updatedLayer, {
      shouldDirty: true,
      shouldValidate: false,
      shouldTouch: true,
    });
  };

  const copyFromPreviousLayer = (currentIndex) => {
    if (currentIndex === 0) {
      toast.error("No previous layer to copy from");
      return;
    }

    const currentLayers = getValues("layer_specifications");
    const previousLayer = currentLayers[currentIndex - 1];
    const currentLayer = currentLayers[currentIndex];

    const hasDataToCopy =
      previousLayer.gsm ||
      previousLayer.bf ||
      previousLayer.color_id !== "" ||
      previousLayer.flute_type;

    if (!hasDataToCopy) {
      toast.error("Previous layer has no data to copy");
      return;
    }

    const updatedLayer = {
      ...currentLayer,
      gsm: previousLayer.gsm || "",
      bf: previousLayer.bf || "",
      color_id: previousLayer.color_id || "",
      flute_type: previousLayer.flute_type || "",
    };

    const calculatedWeight = calculateLayerWeight(
      updatedLayer.gsm,
      updatedLayer.layer_name,
      updatedLayer.flute_type
    );
    const calculatedBS = calculateLayerBurstingStrength(
      updatedLayer.gsm,
      updatedLayer.bf,
      updatedLayer.layer_name
    );

    updatedLayer.weight = calculatedWeight;
    updatedLayer.bursting_strength = calculatedBS;

    const updatedLayers = [...currentLayers];
    updatedLayers[currentIndex] = updatedLayer;
    setValue("layer_specifications", updatedLayers);

    toast.success(`Data copied from previous layer successfully!`);
  };

  const hasPreviousLayerData = (index) => {
    if (index === 0) return false;
    const currentLayers = getValues("layer_specifications");
    if (index >= currentLayers.length) return false;

    const previousLayer = currentLayers[index - 1];
    return (
      previousLayer.gsm ||
      previousLayer.bf ||
      previousLayer.color_id !== "" ||
      previousLayer.flute_type
    );
  };

  const totalWeight = fields.reduce((sum, layer, index) => {
    const currentLayers = getValues("layer_specifications");
    const weight =
      typeof currentLayers[index]?.weight === "number"
        ? currentLayers[index].weight
        : parseFloat(currentLayers[index]?.weight) || 0;
    return sum + weight;
  }, 0);

  const totalBurstingStrength = fields.reduce((sum, layer, index) => {
    const currentLayers = getValues("layer_specifications");
    const strength =
      typeof currentLayers[index]?.bursting_strength === "number"
        ? currentLayers[index].bursting_strength
        : parseFloat(currentLayers[index]?.bursting_strength) || 0;
    return sum + strength;
  }, 0);

  const deepDiff = (obj1, obj2) => {
    const compareObjects = (o1, o2, path = "") => {
      const result = {};

      for (const key in o1) {
        if (o1.hasOwnProperty(key)) {
          const currentPath = path ? `${path}.${key}` : key;

          if (!(key in o2)) {
            result[key] = o1[key];
          } else if (Array.isArray(o1[key]) && Array.isArray(o2[key])) {
            if (JSON.stringify(o1[key]) !== JSON.stringify(o2[key])) {
              result[key] = o1[key];
            }
          } else if (
            typeof o1[key] === "object" &&
            o1[key] !== null &&
            typeof o2[key] === "object" &&
            o2[key] !== null
          ) {
            const nestedChanges = compareObjects(o1[key], o2[key], currentPath);
            if (Object.keys(nestedChanges).length > 0) {
              result[key] = nestedChanges;
            }
          } else if (o1[key] !== o2[key]) {
            result[key] = o1[key];
          }
        }
      }

      return result;
    };

    return compareObjects(obj1, obj2);
  };

  useEffect(() => {
    if (id) {
      ProductService.getById(id)
        .then((res) => {
          if (res.success && res.data) {
            setOriginalData(res.data);
            console.log("Original data:", res.data);

            const productVersion = res.data.ProductVersions?.[0] || {};
            const boardSpec = productVersion.BoardSpecification || {};
            let layerSpecs = productVersion.LayerSpecifications || [];

            const plyCount = boardSpec.ply || 2;

            layerSpecs = layerSpecs.sort(
              (a, b) => Number(a.layer_id || 0) - Number(b.layer_id || 0)
            );

            const layersArray = Array.from({ length: plyCount }, (_, index) => {
              const layerId = index + 1;
              const existingLayer = layerSpecs.find(
                (layer) => Number(layer.layer_id) === layerId
              );

              return {
                layer_id: layerId,
                layer_name: existingLayer?.layer_name || `Layer ${layerId}`,
                gsm: existingLayer?.gsm?.toString() || "",
                bf: existingLayer?.bf?.toString() || "",
                color_id: existingLayer?.color_id || "",
                flute_type: existingLayer?.flute_type || "",
                weight: existingLayer?.weight || 0,
                bursting_strength: existingLayer?.bursting_strength || 0,
              };
            });

            reset({
              product_name: res.data.product_name || "",
              reference_number: res.data.reference_number || "",
              client_reference_code: res.data.client_reference_code || "",
              category: res.data.category || "SKU",
              subcategory: res.data.subcategory || "",
              manufacturer: res.data.manufacturer || "",
              status: res.data.status || "Active",
              company_id: res.data.company_id || "comp-123",
              created_by: res.data.created_by || "user-001",
              board_specifications: {
                units: boardSpec.units || "mm",
                box_length: boardSpec.box_length || "",
                box_width: boardSpec.box_width || "",
                box_height: boardSpec.box_height || "",
                ups: boardSpec.ups || "",
                joints: boardSpec.joints || "",
                deckle_size: boardSpec.deckle_size || "",
                board_length: boardSpec.board_length || "",
                board_width: boardSpec.board_width || "",
                flap_width: boardSpec.flap_width || "",
                length_trimming_tolerance:
                  boardSpec.length_trimming_tolerance || "",
                width_trimming_tolerance:
                  boardSpec.width_trimming_tolerance || "",
                inner_outer_dimension: boardSpec.inner_outer_dimension || "",
                ply: plyCount.toString(),
                strict_adherence: boardSpec.strict_adherence || false,
              },
              layer_specifications: layersArray,
            });
            setIsStrictAdherence(boardSpec.strict_adherence || false);
          }
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
          alert("Error loading product data");
        });
    }
  }, [id, reset]);

  const handleFormSubmit = (data) => {
    console.log("Form Data:", data);
    // const transformedPayload = {
    //   product_name: data.product_name || "",
    //   reference_number: data.reference_number || "",
    //   client_reference_code: data.client_reference_code || "",
    //   description: data.description || "",
    //   category: data.category || "SKU",
    //   subcategory: data.subcategory || "",
    //   stages: "Cutting, Pasting, Packing",
    //   manufacturer: data.manufacturer || "",
    //   stock_unit: "Piece",
    //   min_stock_level: 50,
    //   reorder_level: 20,
    //   status: data.status || "active",
    //   company_id: data.company_id || "comp-123",
    //   created_by: data.created_by || "user-001",

    //   board_specification: {
    //     ply: parseInt(data.board_specifications?.ply) || 2,
    //     units: data.board_specifications?.units || "mm",
    //     box_length: parseFloat(data.board_specifications?.box_length) || 0,
    //     box_width: parseFloat(data.board_specifications?.box_width) || 0,
    //     box_height: parseFloat(data.board_specifications?.box_height) || 0,
    //     ups: parseFloat(data.board_specifications?.ups) || 0,
    //     joints: parseFloat(data.board_specifications?.joints) || 0,
    //     deckle_size: parseFloat(data.board_specifications?.deckle_size) || 0,
    //     board_length: parseFloat(data.board_specifications?.board_length) || 0,
    //     board_width: parseFloat(data.board_specifications?.board_width) || 0,
    //     flap_width: parseFloat(data.board_specifications?.flap_width) || 0,
    //     length_trimming_tolerance:
    //       parseFloat(data.board_specifications?.length_trimming_tolerance) || 0,
    //     width_trimming_tolerance:
    //       parseFloat(data.board_specifications?.width_trimming_tolerance) || 0,
    //     inner_outer_dimension:
    //       data.board_specifications?.inner_outer_dimension || "",
    //     strict_adherence: data.board_specifications?.strict_adherence || false,
    //   },

    //   layer_specifications: (data.layer_specifications || []).map(
    //     (layer, index) => ({
    //       layer_id: index + 1,
    //       layer_name: layer.layer_name || "",
    //       gsm: parseFloat(layer.gsm) || 0,
    //       color_id: layer.color_id || "",
    //       bf: parseFloat(layer.bf) || 0,
    //       flute_type: layer.flute_type || "",
    //       weight: parseFloat(layer.weight) || 0,
    //       bursting_strength: parseFloat(layer.bursting_strength) || 0,
    //     })
    //   ),
    // };

    // if (!id) {
    //   ProductService.create(transformedPayload).then((res) => {
    //     if (res.success) navigate("/sku");
    //     else alert("Error creating product: " + res.message);
    //   });
    //   return;
    // }

    // const originalVersion = originalData?.ProductVersions?.[0] || {};
    // const normalizedOriginal = {
    //   product_name: originalData?.product_name || "",
    //   reference_number: originalData?.reference_number || "",
    //   client_reference_code: originalData?.client_reference_code || "",
    //   description: originalData?.description || "",
    //   category: originalData?.category || "SKU",
    //   subcategory: originalData?.subcategory || "",
    //   stages: "Cutting, Pasting, Packing",
    //   manufacturer: originalData?.manufacturer || "",
    //   stock_unit: "Piece",
    //   min_stock_level: 50,
    //   reorder_level: 20,
    //   status: originalData?.status || "active",
    //   company_id: originalData?.company_id || "comp-123",
    //   created_by: originalData?.created_by || "user-001",

    //   board_specification: {
    //     ply: originalVersion.BoardSpecification?.ply || 2,
    //     units: originalVersion.BoardSpecification?.units || "mm",
    //     box_length: originalVersion.BoardSpecification?.box_length || 0,
    //     box_width: originalVersion.BoardSpecification?.box_width || 0,
    //     box_height: originalVersion.BoardSpecification?.box_height || 0,
    //     ups: originalVersion.BoardSpecification?.ups || 0,
    //     joints: originalVersion.BoardSpecification?.joints || 0,
    //     deckle_size: originalVersion.BoardSpecification?.deckle_size || 0,
    //     board_length: originalVersion.BoardSpecification?.board_length || 0,
    //     board_width: originalVersion.BoardSpecification?.board_width || 0,
    //     flap_width: originalVersion.BoardSpecification?.flap_width || 0,
    //     length_trimming_tolerance:
    //       originalVersion.BoardSpecification?.length_trimming_tolerance || 0,
    //     width_trimming_tolerance:
    //       originalVersion.BoardSpecification?.width_trimming_tolerance || 0,
    //     inner_outer_dimension:
    //       originalVersion.BoardSpecification?.inner_outer_dimension || "",
    //     strict_adherence:
    //       originalVersion.BoardSpecification?.strict_adherence || false,
    //   },

    //   layer_specifications:
    //     originalVersion.LayerSpecifications?.map((layer) => ({
    //       layer_id: layer.layer_id,
    //       layer_name: layer.layer_name || "",
    //       gsm: layer.gsm || 0,
    //       color_id: layer.color_id || "",
    //       bf: layer.bf || 0,
    //       flute_type: layer.flute_type || "",
    //       weight: layer.weight || 0,
    //       bursting_strength: layer.bursting_strength || 0,
    //     })) || [],
    // };

    // const changedData = deepDiff(transformedPayload, normalizedOriginal) || {};
    // let finalData = { ...changedData };
    // if (originalData?.id) finalData.id = originalData.id;

    // if (changedData.board_specification || changedData.layer_specifications) {
    //   const pv = { id: originalVersion.id };

    //   if (changedData.board_specification) {
    //     pv.BoardSpecification = {
    //       id: originalVersion.BoardSpecification?.id,
    //       ...changedData.board_specification,
    //     };
    //   }

    //   if (changedData.layer_specifications) {
    //     pv.LayerSpecifications = changedData.layer_specifications.map(
    //       (layer, i) => ({
    //         id: originalVersion.LayerSpecifications?.[i]?.id,
    //         ...layer,
    //       })
    //     );
    //   }

    //   finalData.ProductVersions = [pv];

    //   delete finalData.board_specification;
    //   delete finalData.layer_specifications;
    // }

    // console.log("Final Payload with IDs:", finalData);

    // ProductService.update(id, finalData).then((res) => {
    //   if (res.success) navigate("/sku");
    //   else alert("Error updating product: " + res.message);
    // });
  };

  return (
    <div>
      <FormLayout
        title={id ? "Edit SKU" : "Add New SKU"}
        subtitle={id ? "Update SKU details" : "Create a new sku"}
        onCancel={() => navigate("/sku")}
        onSubmit={handleSubmit(handleFormSubmit)}
        submitText={id ? "Update SKU" : "Create SKU"}
      >
        <div className="card-corrugated p-4 flex flex-col">
          <div className="mb-4 pb-2 border-b border-manufacturing-200">
            <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
              <div className="bg-primary-100 rounded-full p-1 mr-2">
                <Truck className="h-3 w-3 text-primary-600" />
              </div>
              SKU Information
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                Sku Type *
              </label>
              <select
                {...register("subcategory", {
                  required: "SKU Type is required",
                })}
                onChange={(e) => {
                  reset((prev) => ({
                    ...prev,
                    subcategory: e.target.value,
                  }));
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                  errors.subcategory ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select SKU Type</option>
                <option value="RSC Box">RSC Box</option>
                <option value="Die">Die-Cut Box</option>
              </select>
              {errors.subcategory && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.subcategory.message}
                </p>
              )}
            </div>

            {[
              { label: "SKU Name *", name: "product_name", type: "text" },
              { label: "Client Name *", name: "manufacturer", type: "text" },
              {
                label: "Client Reference Code *",
                name: "client_reference_code",
                type: "text",
              },
              {
                label: "Reference Number *",
                name: "reference_number",
                type: "text",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-manufacturing-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  {...register(field.name, {
                    required: field.label.includes("*")
                      ? `${field.label.replace("*", "").trim()} is required`
                      : false,
                  })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-corrugated-500 ${
                    errors[field.name] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={`Enter ${field.label
                    .replace("*", "")
                    .toLowerCase()}`}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[field.name].message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedSubcategory === "Die" && (
          <DieInformation
            register={register}
            errors={errors}
            dieProducts={dieProducts}
            setValue={setValue}
            watch={watch}
          />
        )}

        {selectedSubcategory !== "Die" && (
          <>
            <BoardInformation
              register={register}
              errors={errors}
              handleInputChange={handleInputChange}
              handleUnitChange={handleUnitChange}
              helperBoard={helperBoard}
            />
            <LayerConfiguration
              fields={fields}
              layers={layers}
              selectedPly={selectedPly}
              plyOptions={plyOptions}
              fluteTypes={fluteTypes}
              errors={errors}
              watch={watch}
              register={register}
              setValue={setValue}
              updateLayer={updateLayer}
              copyFromPreviousLayer={copyFromPreviousLayer}
              hasPreviousLayerData={hasPreviousLayerData}
              isCorrugationLayer={isCorrugationLayer}
              totalWeight={totalWeight}
              totalBurstingStrength={totalBurstingStrength}
              readOnly={isStrictAdherence}
            />
          </>
        )}
      </FormLayout>
    </div>
  );
};

export default AddSku;
