import api from "./api";
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
};
