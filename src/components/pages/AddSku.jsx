import { useEffect, useState } from "react";
import FormLayout from "../form/FormLayout";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  Edit,
  FileText,
  Layers,
  Package,
  Trash2,
  Truck,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { ProductService } from "../../services/ProductServices";
import { ClientService } from "../../services/ClientServices";
import { RouteServices } from "../../services/RouteServices";
import { FluteServices } from "../../services/FluteServices";
import { ColorServices } from "../../services/ColorServices";
import { TaxServices } from "../../services/TaxServices";
import BoardInformation from "./BoardInformation";
import DieInformation from "./DieInformation";
import DocumentsUpload from "./DocumentsUpload";
import PartitionInformation from "./PartitionInformation";
import SkuInformation from "./SkuInformation";
import GroupPartSection from "./GroupPartSection";
import api from "../../services/api";

const AddSku = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const plyOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const [helperBoard, setHelperBoard] = useState(0);
  const [calculatedDeckleSize, setCalculatedDeckleSize] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isStrictAdherence, setIsStrictAdherence] = useState(false);
  const [dieProducts, setDieProducts] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [flutes, setFlutes] = useState([]);
  const [colors, setColors] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [editingPartId, setEditingPartId] = useState(null);
  const [partNameInput, setPartNameInput] = useState("");
  const [skuList, setSkuList] = useState([]);
  const [printDocuments, setPrintDocuments] = useState([]);

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

  const [groups, setGroups] = useState([
    {
      id: Date.now(),
      name: "",
      parts: [
        {
          id: Date.now() + 1,
          name: "",
          sku: "",
          layers: [],
        },
      ],
    },
  ]);

  const addGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: "",
      parts: [
        {
          id: Date.now() + 1,
          name: "",
          sku: "",
          layers: [],
        },
      ],
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);

    // ✅ Also update react-hook-form field
    setValue("group_part_specifications", updatedGroups, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeGroup = (groupId) => {
    const updatedGroups = groups.filter((g) => g.id !== groupId);
    setGroups(updatedGroups);

    // ✅ Sync with react-hook-form
    setValue("group_part_specifications", updatedGroups, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updateGroupName = (id, newName) => {
    const updatedGroups = groups.map((g) =>
      g.id === id ? { ...g, name: newName } : g
    );
    setGroups(updatedGroups);

    setValue("group_part_specifications", updatedGroups, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updatePartName = (groupId, partId, newName) => {
    const updatedGroups = groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            parts: g.parts.map((p) =>
              p.id === partId ? { ...p, name: newName } : p
            ),
          }
        : g
    );
    setGroups(updatedGroups);

    setValue("group_part_specifications", updatedGroups, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addPart = (groupId) => {
    const newPart = {
      id: Date.now(),
      name: "",
      sku: "",
      ply: 2,
      layers: [],
    };

    setGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? { ...group, parts: [...group.parts, newPart] }
          : group
      )
    );
  };

  const removePart = (groupId, partId) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId
        ? { ...group, parts: group.parts.filter((p) => p.id !== partId) }
        : group
    );

    setGroups(updatedGroups);

    // ✅ Sync with react-hook-form
    setValue("group_part_specifications", updatedGroups, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (!getValues("group_part_specifications")?.length) {
      setValue("group_part_specifications", groups);
    }
  }, []);

  useEffect(() => {
    const fetchSkus = async () => {
      try {
        const response = await ProductService.getAll({ categoryFilter: "sku" });
        setSkuList(response.data?.products || []);
      } catch (error) {
        console.error("Failed to fetch SKU list:", error);
      }
    };
    fetchSkus();
  }, []);

  const methods = useForm({
    defaultValues: {
      product_name: "",
      reference_number: "",
      client_reference_code: "",
      category: "SKU",
      manufacturer: "",
      subcategory: "",
      stock_unit: "",
      min_stock_level: "",
      method: "",
      status: "active",
      company_id: "comp-123",
      created_by: "user-001",
      tax_specifications: {
        gst_percentage: "",
        hsn_code: "",
      },
      color_specifications: [
        {
          color_code: "",
        },
      ],
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
      sku_die_specifications: {
        board_length: "",
        board_width: "",
        impressions: "",
        ups: "",
      },
      partition_specifications: {
        columns: "",
        rows: "",
        board_length: "",
        board_width: "",
        die_id: "",
        ups: "",
        deckle_size: "",
        auto_calc_ratio: "",
      },
      composite_specifications: {
        sku_id: "",
        quantity: "",
      },
      print_specifications: {
        print_type: "",
      },
      print_documents: [],
      route_specifications: [
        {
          route_id: "",
        },
      ],
      group_part_specifications: [
        {
          group_name: "",
          parts: [
            {
              part_name: "",
              layers: [
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
          ],
        },
      ],
      method_specifications: {
        method: "",
        wire_type: "",
        number_of_pins: "",
        position: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = methods;

  const selectedPly = watch("board_specifications.ply");
  const boardSpecs = watch("board_specifications");
  const layers = watch("layer_specifications");
  const selectedSubcategory = watch("subcategory");
  const selectedPrintType = watch("print_specifications.print_type");

  // --- Helpers (place near top of component) ---
  const makeFileEntry = (file) => ({
    id:
      (crypto && crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    file, // keep File for upload
  });

  // --- handleFileInput (for <input type="file" />) ---
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Map to normalized objects
    const newEntries = files.map(makeFileEntry);

    // Limit: keep at most 10 total
    setPrintDocuments((prev) => {
      const merged = [...prev, ...newEntries].slice(0, 10);
      // Update form value as well
      setValue("print_documents", merged, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return merged;
    });
  };

  /// --- handleUpload (for drag & drop) ---
  const handleUpload = (files) => {
    const incoming = Array.from(files || []);

    // filter valid types + sizes
    const validFiles = incoming.filter((file) => {
      const isValidType = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Map to normalized entries WITHOUT including any existing docs again
    const newEntries = validFiles.map(makeFileEntry);

    // Merge into local state and form state with a single concat (no duplication)
    setPrintDocuments((prev) => {
      const merged = [...prev, ...newEntries].slice(0, 10);
      setValue("print_documents", merged, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return merged;
    });
  };

  /// --- onRemove (accepts id) ---
  const onRemove = (id) => {
    if (!id) return;
    // Update react-hook-form value
    const currentDocs = watch("print_documents") || [];
    const updatedDocs = Array.isArray(currentDocs)
      ? currentDocs.filter((doc) => doc.id !== id)
      : [];

    setValue("print_documents", updatedDocs, {
      shouldValidate: true,
      shouldDirty: true,
    });
    // Also update local state
    setPrintDocuments(updatedDocs);
  };
  useEffect(() => {
    const groupPartSpecs = groups
      .filter((group) => group.name.trim() !== "")
      .map((group) => ({
        group_name: group.name,
        parts: group.parts
          .filter((part) => part.name.trim() !== "")
          .map((part) => ({
            part_name: part.name,
            layers: part.layers || [],
          })),
      }));
    setValue("group_part_specifications", groupPartSpecs);
  }, [groups, setValue]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await ClientService.getAllClients();
        console.log("Clients:", response.data);
        setClientList(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
      try {
        const response = await RouteServices.getAllRoutes();
        console.log("Routes:", response.data);
        setRoutes(response.data);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
      try {
        const response = await FluteServices.getAllFlutes();
        console.log("Flutes:", response.data);
        setFlutes(response.data);
      } catch (error) {
        console.error("Error fetching flutes:", error);
      }
      try {
        const response = await ColorServices.getAllColors();
        console.log("Colors:", response.data);
        setColors(response.data);
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
      try {
        const response = await TaxServices.getAllTaxes();
        console.log("Taxes:", response.data);
        setTaxes(response.data);
      } catch (error) {
        console.error("Error fetching taxes:", error);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    const fetchDieProducts = async () => {
      console.log("inside the fetch die products");
      const result = await ProductService.getDieProducts({
        categoryFilter: "sku",
      });
      console.log("Products Die:", result);
      setDieProducts(result?.data?.products);
    };
    fetchDieProducts();
  }, [selectedSubcategory]);

  useEffect(() => {
    if (!selectedPly) setValue("board_specifications.ply", plyOptions[0]);
  }, [selectedPly, setValue]);

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
    const calculatedDeckleSizeValue = widthBoardSize || null;
    setCalculatedDeckleSize(calculatedDeckleSizeValue);

    return {
      length_board_size: Number(lengthBoardSize.toFixed(2)),
      width_board_size: Number(widthBoardSize.toFixed(2)),
      calculated_deckle_size: calculatedDeckleSize,
      ups: Number(upsval.toFixed()),
    };
  };

  const calculateLayerWeight = (gsm, layerName, fluteType) => {
    const deckleSize = parseFloat(boardSpecs?.deckle_size) || 0;
    const boardLength = parseFloat(boardSpecs?.board_length) || 0;
    const gsmValue = parseFloat(gsm) || 0;

    if (deckleSize === 0 || boardLength === 0 || gsmValue === 0) {
      return 0;
    }

    const isCorrugation = isCorrugationLayer(layerName);

    if (isCorrugation && fluteType) {
      const selectedFlute = flutes.find((flute) => flute.id === fluteType);
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
  const updateLayer = (groupIndex, partIndex, layerIndex, field, value) => {
    setGroups((prevGroups) => {
      const updatedGroups = [...prevGroups];
      const group = updatedGroups[groupIndex];
      if (!group) return prevGroups;

      const part = group.parts[partIndex];
      if (!part) return prevGroups;

      if (!Array.isArray(part.layers)) part.layers = [];

      // Ensure the layer exists
      while (part.layers.length <= layerIndex) {
        part.layers.push({
          layer_id: part.layers.length,
          layer_name: "",
          gsm: "",
          bf: "",
          flute_type: "",
          color_id: "",
          weight: "",
          bursting_strength: "",
        });
      }

      part.layers[layerIndex] = {
        ...part.layers[layerIndex],
        [field]: value,
      };

      return updatedGroups;
    });
  };

  const copyFromPreviousLayer = (groupIndex, partIndex, currentLayerIndex) => {
    if (currentLayerIndex === 0) {
      toast.error("No previous layer to copy from");
      return;
    }

    setGroups((prevGroups) => {
      const updatedGroups = [...prevGroups];
      const group = updatedGroups[groupIndex];
      if (!group) return prevGroups;

      const part = group.parts[partIndex];
      if (!part) return prevGroups;

      if (!Array.isArray(part.layers)) part.layers = [];

      const previousLayer = part.layers[currentLayerIndex - 1];
      const currentLayer = part.layers[currentLayerIndex];

      if (!previousLayer) {
        toast.error("Previous layer data not found");
        return prevGroups;
      }

      const hasDataToCopy =
        previousLayer.gsm || previousLayer.bf || previousLayer.color_id !== "";

      if (!hasDataToCopy) {
        toast.error("Previous layer has no data to copy");
        return prevGroups;
      }

      // Ensure the current layer exists
      while (part.layers.length <= currentLayerIndex) {
        part.layers.push({
          layer_id: part.layers.length,
          layer_name: "",
          gsm: "",
          bf: "",
          flute_type: "",
          color_id: "",
          weight: "",
          bursting_strength: "",
        });
      }

      const updatedLayer = {
        ...part.layers[currentLayerIndex],
        gsm: previousLayer.gsm || "",
        bf: previousLayer.bf || "",
        color_id: previousLayer.color_id || "",
      };

      updatedLayer.weight = calculateLayerWeight(
        updatedLayer.gsm,
        updatedLayer.layer_name,
        ""
      );
      updatedLayer.bursting_strength = calculateLayerBurstingStrength(
        updatedLayer.gsm,
        updatedLayer.bf,
        updatedLayer.layer_name
      );

      part.layers[currentLayerIndex] = updatedLayer;

      toast.success("Data copied from previous layer successfully!");
      return updatedGroups;
    });
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
    const compareObjects = (o1, o2) => {
      const result = {};

      for (const key in o1) {
        if (Object.prototype.hasOwnProperty.call(o1, key)) {
          if (!(key in o2)) {
            result[key] = o1[key];
          } else if (Array.isArray(o1[key]) && Array.isArray(o2[key])) {
            // Compare arrays deeply
            if (JSON.stringify(o1[key]) !== JSON.stringify(o2[key])) {
              result[key] = o1[key];
            }
          } else if (
            typeof o1[key] === "object" &&
            o1[key] !== null &&
            typeof o2[key] === "object" &&
            o2[key] !== null
          ) {
            const nestedChanges = compareObjects(o1[key], o2[key]);
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

            let dieSpec = {};
            let dieLayouts = [];

            const groupSpecs = productVersion.GroupSpecifications || [];
            const partSpecs = productVersion.PartsSpecifications || [];

            // ✅ New: extract color details
            const colorSpecs = productVersion.ProductColors?.map((color) => ({
              color_code: color.color || "",
            })) || [
              {
                color_code: "",
              },
            ];

            // ✅ New: extract print documents
            const printDocs =
              productVersion.PrintDocuments?.map((doc) => ({
                id: doc.id,
                document_id: doc.document_id,
                file_path: doc.Document?.document || "",
              })) || [];

            if (groupSpecs.length > 0) {
              const reconstructedGroups = groupSpecs.map((group, index) => {
                const groupParts = partSpecs.filter(
                  (part) => part.group_name === group.group_name
                );

                return {
                  id: Date.now() + index,
                  name: group.group_name || "",
                  parts:
                    groupParts.length > 0
                      ? groupParts.map((part, pIndex) => ({
                          id: Date.now() + index + pIndex + 1000,
                          name: part.part_name || "",
                          sku: "",
                          layers: [],
                        }))
                      : [
                          {
                            id: Date.now() + index + 1000,
                            name: "",
                            sku: "",
                            layers: [],
                          },
                        ],
                };
              });

              setGroups(reconstructedGroups);
            }

            if (res.data.subcategory === "Die-Cut") {
              dieSpec = productVersion?.SkuDieSpecification;
            }

            // ✅ Add color_specifications and print_documents to reset
            reset({
              product_name: res.data.product_name || "",
              reference_number: res.data.reference_number || "",
              client_reference_code: res.data.client_reference_code || "",
              category: res.data.category || "SKU",
              subcategory: res.data.subcategory || "",
              manufacturer: res.data.manufacturer || "",
              status: res.data.status || "Active",
              stock_unit: res.data.stock_unit || "",
              min_stock_level: res.data.min_stock_level || 0,
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
              tax_specifications: {
                gst_percentage: productVersion.ProductTax?.gst_percentage || 0,
                hsn_code: productVersion.ProductTax?.hsn_code || 0,
              },
              route_specifications: productVersion.ProductRoute || [],
              method_specifications: {
                method: productVersion.MethodSpecification?.method || "",
                wire_type: productVersion.MethodSpecification?.wire_type || "",
                number_of_pins:
                  productVersion.MethodSpecification?.number_of_pins || "",
                position: productVersion.MethodSpecification?.position || "",
              },
              sku_die_specifications: {
                die_id: dieSpec?.die_id || "",
                board_width: dieSpec?.board_width || "",
                board_height: dieSpec?.board_height || "",
                ups: dieSpec?.ups || "",
                deckle_size: dieSpec?.deckle_size || "",
              },
              partition_specifications: {
                die_id: productVersion?.PartitionSpecification?.die_id,
                board_length:
                  productVersion?.PartitionSpecification?.board_length,
                board_width:
                  productVersion?.PartitionSpecification?.board_width,
                columns: productVersion?.PartitionSpecification?.columns,
                rows: productVersion?.PartitionSpecification?.rows,
                ups: productVersion?.PartitionSpecification?.ups,
                auto_calc_ratio:
                  productVersion?.PartitionSpecification?.auto_calc_ratio,
              },
              composite_specifications: {
                sku_id:
                  productVersion?.CompositeSkuSpecification &&
                  productVersion.CompositeSkuSpecification.length > 0
                    ? productVersion.CompositeSkuSpecification[0]
                        ?.sku_product_version_id
                    : "",
                quantity:
                  productVersion?.CompositeSkuSpecification &&
                  productVersion.CompositeSkuSpecification.length > 0
                    ? productVersion.CompositeSkuSpecification[0]?.quantity
                    : "",
              },
              die_sku_layouts: dieLayouts,
              group_specifications: groupSpecs,
              parts_specifications: partSpecs,

              // ✅ new fields mapped
              color_specifications: colorSpecs,
              print_documents: printDocs,
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

  const handleFormSubmit = async (data) => {
    console.log("Form Data:", data);

    const groups = data.group_specifications || [];
    const parts = data.parts_specifications || [];

    // ---- Check for unnamed or default group names ----
    const invalidGroups = groups.filter(
      (g) =>
        !g.name ||
        g.name.trim() === "" ||
        g.name.trim().toLowerCase().startsWith("group")
    );
    if (invalidGroups.length > 0) {
      alert("Please rename all groups from their default names before saving.");
      return;
    }

    // ---- Check for duplicate group names ----
    const groupNames = groups.map((g) => g.name.trim().toLowerCase());
    const hasDuplicateGroups = new Set(groupNames).size !== groupNames.length;
    if (hasDuplicateGroups) {
      alert("Duplicate group names found. Please use unique group names.");
      return;
    }

    // ---- Check for unnamed or default part names ----
    const invalidParts = parts.filter(
      (p) =>
        !p.name ||
        p.name.trim() === "" ||
        p.name.trim().toLowerCase().startsWith("part")
    );
    if (invalidParts.length > 0) {
      alert("Please rename all parts from their default names before saving.");
      return;
    }

    // ---- Check for duplicate part names within each group ----
    const groupedParts = {};
    parts.forEach((p) => {
      if (!groupedParts[p.group_id]) groupedParts[p.group_id] = [];
      groupedParts[p.group_id].push(p.name.trim().toLowerCase());
    });

    for (const [names] of Object.entries(groupedParts)) {
      const hasDuplicates = new Set(names).size !== names.length;
      if (hasDuplicates) {
        alert(
          "Duplicate part names found within the same group. Please make them unique."
        );
        return;
      }
    }

    console.log("✅ Group and Part name validation passed");

    const basePayload = {
      product_name: data.product_name || "",
      reference_number: data.reference_number || "",
      client_reference_code: data.client_reference_code || "",
      description: data.description || "",
      category: data.category || "SKU",
      subcategory: data.subcategory || "",
      stages: data?.stages || "",
      manufacturer: data.manufacturer || "",
      stock_unit: data.stock_unit,
      min_stock_level: data.min_stock_level,
      reorder_level: data.reorder_level,
      status: data.status || "active",
      company_id: data.company_id || "comp-123",
      created_by: data.created_by || "user-001",
    };

    basePayload.group_part_specifications = data.group_part_specifications || [];
    basePayload.color_specifications = data.color_specifications || [];

    basePayload.board_specification = {
      ply: parseInt(data.board_specifications?.ply) || 2,
      units: data.board_specifications?.units || "mm",
      box_length: parseFloat(data.board_specifications?.box_length) || 0,
      box_width: parseFloat(data.board_specifications?.box_width) || 0,
      box_height: parseFloat(data.board_specifications?.box_height) || 0,
      ups: parseFloat(data.board_specifications?.ups) || 0,
      joints: parseFloat(data.board_specifications?.joints) || 0,
      deckle_size: parseFloat(data.board_specifications?.deckle_size) || 0,
      board_length: parseFloat(data.board_specifications?.board_length) || 0,
      board_width: parseFloat(data.board_specifications?.board_width) || 0,
      flap_width: parseFloat(data.board_specifications?.flap_width) || 0,
      length_trimming_tolerance:
        parseFloat(data.board_specifications?.length_trimming_tolerance) || 0,
      width_trimming_tolerance:
        parseFloat(data.board_specifications?.width_trimming_tolerance) || 0,
      inner_outer_dimension:
        data.board_specifications?.inner_outer_dimension || "",
      strict_adherence: data.board_specifications?.strict_adherence || false,
    };

    basePayload.layer_specifications = (data.layer_specifications || []).map(
      (layer, index) => ({
        layer_id: index + 1,
        layer_name: layer.layer_name || "",
        gsm: parseFloat(layer.gsm) || 0,
        color_id: layer.color_id || "",
        bf: parseFloat(layer.bf) || 0,
        flute_type: layer.flute_type || "",
        weight: parseFloat(layer.weight) || 0,
        bursting_strength: parseFloat(layer.bursting_strength) || 0,
      })
    );

    basePayload.tax_specifications = {
      gst_percentage: parseFloat(data.tax_specifications?.gst_percentage) || 0,
      hsn_code: data.tax_specifications?.hsn_code || "",
    };

    basePayload.route_specifications = (data.route_specifications || []).filter(
      (r) => r.route_id && r.route_id !== ""
    );

    if (data.subcategory === "Die-Cut") {
      basePayload.sku_die_specifications = {
        die_id: data.sku_die_specifications?.die_id,
        board_length:
          parseFloat(data.sku_die_specifications?.board_length) || 0,
        board_width: parseFloat(data.sku_die_specifications?.board_width) || 0,
        ups: parseFloat(data.sku_die_specifications?.ups) || 0,
        deckle_size: parseFloat(data.sku_die_specifications?.deckle_size) || 0,
      };
    } else if (data.subcategory === "Partition") {
      basePayload.partition_specifications = {
        die_id: data.partition_specifications?.die_id || "",
        columns: parseInt(data.partition_specifications?.columns) || 0,
        rows: parseInt(data.partition_specifications?.rows) || 0,
        board_length:
          parseFloat(data.partition_specifications?.board_length) || 0,
        board_width:
          parseFloat(data.partition_specifications?.board_width) || 0,
        ups: parseFloat(data.partition_specifications?.ups) || 0,
        deckle_size:
          parseFloat(data.partition_specifications?.deckle_size) || 0,
        auto_calc_ratio:
          parseFloat(data.partition_specifications?.auto_calc_ratio) || 0,
      };
    } else if (data.subcategory === "Composite") {
      basePayload.composite_specifications = {
        sku_id: data.composite_specifications?.sku_id || "",
        quantity: data.composite_specifications?.quantity || 0,
      };
    }

    basePayload.method_specifications = {
      method: data.method_specifications?.method || "",
      wire_type: data.method_specifications?.wire_type || "",
      number_of_pins: parseInt(data.method_specifications?.number_of_pins) || 0,
      position: data.method_specifications?.position || "",
    };

    console.log("Base Payload", basePayload);

    try {
      if (!id) {
        let responseData = null;

        if (data.print_documents && data.print_documents.length > 0) {
          const formData = new FormData();
          formData.append("data", JSON.stringify(basePayload));
          printDocuments.forEach((entry) =>
            formData.append("print_documents", entry.file)
          );

          const response = await api.post("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          responseData = response.data;
        } else {
          responseData = await ProductService.create(basePayload);
        }

        const created = responseData?.success === true;

        if (!created) {
          throw new Error(responseData?.message || "Product creation failed");
        }

        navigate("/sku");
        return;
      }

      const originalVersion = originalData?.ProductVersions?.[0] || {};
      const normalizedOriginal = {
        product_name: originalData?.product_name || "",
        reference_number: originalData?.reference_number || "",
        client_reference_code: originalData?.client_reference_code || "",
        description: originalData?.description || "",
        category: originalData?.category || "SKU",
        subcategory: originalData?.subcategory || "",
        stages:
          originalData?.subcategory === "RSC Box"
            ? "Cutting, Pasting, Packing"
            : "production",
        manufacturer: originalData?.manufacturer || "",
        stock_unit:
          originalData?.stock_unit ||
          (originalData?.subcategory === "RSC Box" ? "Piece" : "pcs"),
        min_stock_level: originalData?.min_stock_level || 0,
        reorder_level:
          originalData?.reorder_level ||
          (originalData?.subcategory === "RSC Box" ? 20 : 100),
        status: originalData?.status || "active",
        company_id: originalData?.company_id || "comp-123",
        created_by: originalData?.created_by || "user-001",

        board_specifications: originalVersion.BoardSpecification || {},
        layer_specifications: originalVersion.LayerSpecifications || [],
        tax_specifications: {
          gst_percentage: originalVersion.ProductTax?.gst_percentage || 0,
          hsn_code: originalVersion.ProductTax?.hsn_code || 0,
        },
        route_specifications: originalVersion.ProductRoute || [],
        method_specifications: {
          method: originalVersion.MethodSpecification?.method || "",
          wire_type: originalVersion.MethodSpecification?.wire_type || "",
          number_of_pins:
            originalVersion.MethodSpecification?.number_of_pins || "",
          position: originalVersion.MethodSpecification?.position || "",
        },
        sku_die_specifications: originalVersion.SkuDieSpecification || {},
        partition_specifications: {
          die_id: originalVersion.PartitionSpecification?.die_id || "",
          board_length:
            originalVersion.PartitionSpecification?.board_length || "",
          board_width:
            originalVersion.PartitionSpecification?.board_width || "",
          columns: originalVersion.PartitionSpecification?.columns || "",
          rows: originalVersion.PartitionSpecification?.rows || "",
          ups: originalVersion.PartitionSpecification?.ups || "",
          auto_calc_ratio:
            originalVersion.PartitionSpecification?.auto_calc_ratio || "",
        },
        composite_specifications: originalVersion.CompositeSkuSpecification?.[0]
          ? {
              sku_id:
                originalVersion.CompositeSkuSpecification[0]
                  .sku_product_version_id || "",
              quantity:
                originalVersion.CompositeSkuSpecification[0].quantity || "",
            }
          : { sku_id: "", quantity: "" },
        die_sku_layouts: originalVersion.DieSkuLayouts || [],
        print_documents: (originalVersion.PrintDocuments || []).map((d) => ({
          id: d.id,
          name: d.name,
          size: d.size,
          uploaded: !!d.uploaded,
        })),
        group_specifications: originalVersion.GroupSpecifications || [],
        parts_specifications: originalVersion.PartsSpecifications || [],
      };

      const changedData = deepDiff(basePayload, normalizedOriginal) || {};
      const finalUpdateData = {
        ...(changedData.product_name && {
          product_name: changedData.product_name,
        }),
        ...(changedData.reference_number && {
          reference_number: changedData.reference_number,
        }),
        ...(changedData.client_reference_code && {
          client_reference_code: changedData.client_reference_code,
        }),
        ...(changedData.description && {
          description: changedData.description,
        }),
        ...(changedData.category && { category: changedData.category }),
        ...(changedData.subcategory && {
          subcategory: changedData.subcategory,
        }),
        ...(changedData.stages && { stages: changedData.stages }),
        ...(changedData.manufacturer && {
          manufacturer: changedData.manufacturer,
        }),
        ...(changedData.stock_unit && { stock_unit: changedData.stock_unit }),
        ...(changedData.min_stock_level !== undefined && {
          min_stock_level: changedData.min_stock_level,
        }),
        ...(changedData.reorder_level !== undefined && {
          reorder_level: changedData.reorder_level,
        }),
        ...(changedData.status && { status: changedData.status }),

        ProductVersions: [
          {
            id: originalVersion.id,
            version_name: originalVersion.version_name,
            description: originalVersion.description,

            ...(changedData.board_specification && {
              board_specification: changedData.board_specification,
            }),
            ...(changedData.layer_specifications && {
              layer_specifications: changedData.layer_specifications,
            }),
            ...(changedData.tax_specifications && {
              tax_specifications: changedData.tax_specifications,
            }),
            ...(changedData.route_specifications && {
              route_specifications: changedData.route_specifications,
            }),
            ...(changedData.method_specifications && {
              method_specifications: changedData.method_specifications,
            }),
            ...(changedData.sku_die_specifications && {
              sku_die_specifications: changedData.sku_die_specifications,
            }),
            ...(changedData.partition_specifications && {
              partition_specifications: changedData.partition_specifications,
            }),
            ...(changedData.composite_specifications && {
              composite_specifications: changedData.composite_specifications,
            }),
          },
        ],
      };

      console.log("finalUpdateData   =     ", finalUpdateData);

      const updateFormData = new FormData();
      updateFormData.append("data", JSON.stringify(finalUpdateData));

      if (data.print_documents && data.print_documents.length > 0) {
        data.print_documents.forEach((file) => {
          if (file instanceof File) {
            updateFormData.append("print_documents", file);
          }
        });
      }

      const updateResponse = await ProductService.update(id, updateFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated =
        updateResponse &&
        (updateResponse.success === true ||
          updateResponse.success === "true" ||
          updateResponse.success === 1 ||
          updateResponse.success === "1");

      if (!updated) {
        throw new Error(updateResponse?.message || "Product update failed");
      }

      navigate("/sku");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(err?.message || "Failed to submit SKU");
    }
  };

  return (
    <div>
      <FormProvider {...methods}>
        <FormLayout
          title={id ? "Edit SKU" : "Add New SKU"}
          subtitle={id ? "Update SKU details" : "Create a new sku"}
          onCancel={() => navigate("/sku")}
          onSubmit={handleSubmit(handleFormSubmit)}
          submitText={id ? "Update SKU" : "Create SKU"}
        >
          <SkuInformation
            register={register}
            errors={errors}
            reset={reset}
            watch={watch}
            setValue={setValue}
            clientList={clientList}
            taxes={taxes}
          />

          <BoardInformation
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            handleInputChange={handleInputChange}
            handleUnitChange={handleUnitChange}
            helperBoard={helperBoard}
            control={control}
            routes={routes}
            selectedPrintType={selectedPrintType}
          />
          {selectedPrintType !== "" && (
            <div className="card-corrugated p-4 flex flex-col mt-4">
              {/* Section Header */}
              <div className="mb-4 pb-2 border-b border-manufacturing-200">
                <h3 className="text-base font-medium text-manufacturing-800 flex items-center">
                  <div className="bg-primary-100 rounded-full p-1 mr-2">
                    <FileText className="h-3 w-3 text-primary-600" />
                  </div>
                  Print Documents
                </h3>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(
                    "border-blue-500",
                    "bg-blue-50"
                  );
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "border-blue-500",
                    "bg-blue-50"
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "border-blue-500",
                    "bg-blue-50"
                  );
                  handleUpload(Array.from(e.dataTransfer.files || []));
                }}
              >
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <label
                      htmlFor="documents-upload"
                      className="cursor-pointer"
                    >
                      <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Upload print documents
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
                    <span className="text-sm text-gray-500">
                      {" "}
                      or drag and drop
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, WEBP up to 10MB each (max 10 files)
                  </p>
                </div>
              </div>
              {printDocuments.length > 0 && (
                <div className="space-y-3 mt-4">
                  {printDocuments.map((document) => (
                    <div
                      key={document.id}
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
          )}

          {selectedSubcategory === "Die-Cut" && (
            <DieInformation
              register={register}
              errors={errors}
              dieProducts={dieProducts}
              setValue={setValue}
              getValues={getValues}
              watch={watch}
              control={control}
            />
          )}
          {selectedSubcategory === "Partition" && (
            <PartitionInformation
              register={register}
              dieProducts={dieProducts}
            />
          )}

          {selectedSubcategory !== "" && (
            <GroupPartSection
              selectedSubcategory={selectedSubcategory}
              groups={groups}
              editingGroupId={editingGroupId}
              setEditingGroupId={setEditingGroupId}
              groupNameInput={groupNameInput}
              setGroupNameInput={setGroupNameInput}
              editingPartId={editingPartId}
              setEditingPartId={setEditingPartId}
              partNameInput={partNameInput}
              setPartNameInput={setPartNameInput}
              addGroup={addGroup}
              addPart={addPart}
              removeGroup={removeGroup}
              removePart={removePart}
              updateGroupName={updateGroupName}
              updatePartName={updatePartName}
              skuList={skuList}
              register={register}
              errors={errors}
              fields={fields}
              layers={layers}
              selectedPly={selectedPly}
              plyOptions={plyOptions}
              watch={watch}
              setValue={setValue}
              updateLayer={updateLayer}
              copyFromPreviousLayer={copyFromPreviousLayer}
              hasPreviousLayerData={hasPreviousLayerData}
              isCorrugationLayer={isCorrugationLayer}
              totalWeight={totalWeight}
              totalBurstingStrength={totalBurstingStrength}
              isStrictAdherence={isStrictAdherence}
              routes={routes}
              flutes={flutes}
              colors={colors}
              control={control}
              setGroups={setGroups}
            />
          )}
        </FormLayout>
      </FormProvider>
    </div>
  );
};

export default AddSku;
