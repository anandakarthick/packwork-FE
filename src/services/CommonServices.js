import api from "./api";
const GST_KEY = "2ae33651e3cf9ec8611b7c417f86c339";
// const GST_KEY = "54f0f907adda3e46a178332e8e72c565";
export const CommonService = {
  uploadDocuments: async (data) => {
    try {
      const response = await api.post("/common/documents", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading documents:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload document",
      };
    }
  },
  updateDocuments: async (id, data) => {
    try {
      const response = await api.put(`/common/documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating documents:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteDocuemnts: async (id) => {
    try {
      const response = await api.delete(`/common/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting documents:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  createConfig: async (data) => {
    try {
      const response = await api.post("/common/configs", data);
      return response.data;
    } catch (error) {
      console.error("Error creating config:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateConfig: async (id, data) => {
    try {
      const response = await api.put(`/common/configs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating config:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteConfig: async (id) => {
    try {
      const response = await api.delete(`/common/configs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting config:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  getGroupedConfigs: async () => {
    try {
      const response = await api.get("/common/configs/grouped");
      return response.data;
    } catch (error) {
      console.error("Error fetching configs:", error);
      return { success: false, data: [] };
    }
  },

  getAllCountries: async () => {
    try {
      const response = await api.get("/common/countries");
      return response.data;
    } catch (error) {
      console.error("Error fetching countries:", error);
      return { success: false, data: [] };
    }
  },
  getAllStates: async (countryId) => {
    try {
      const response = await api.get(`/common/states`, {
        params: { countryId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching states:", error);
      return { success: false, data: [] };
    }
  },
  getAllCities: async (stateId) => {
    try {
      const response = await api.get(`/common/cities`, { params: { stateId } });
      return response.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return { success: false, data: [] };
    }
  },
  getStatesByCountry: async (countryId) => {
    try {
      const response = await api.get(`/common/states/country/${countryId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching states by country:", error);
      return { success: false, data: [] };
    }
  },
  getCitiesByState: async (stateId) => {
    try {
      const response = await api.get(`common/cities/state/${stateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      return { success: false, data: [] };
    }
  },
  checkGSTIN: async (gstin) => {
    console.log("GSTKEY", GST_KEY);
    console.log("GSTIN", gstin);
    try {
      const response = await api.get(
        `https://sheet.gstincheck.co.in/check/${GST_KEY}/${gstin}`
      );
      console.log("API Response:", response?.data);

      if (response?.data?.flag && response?.data?.data) {
        return response.data.data;
      } else {
        return {
          success: false,
          message: response?.data?.message || "Invalid response",
        };
      }
    } catch (error) {
      console.error("Error checking GSTIN:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error fetching GSTIN",
      };
    }
  },
};
