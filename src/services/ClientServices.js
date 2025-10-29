import api from "./api";

export const ClientService = {
  getAllClients: async (params = {}) => {
    try {
      console.log("Fetching clients with params:", params);
      const response = await api.get("/customer", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      return { success: false, data: [] };
    }
  },
  getClientById: async (id) => {
    try {
      const response = await api.get(`/customer/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      return { success: false, data: null };
    }
  },

  linkCustomerToDocuments: async (id, data) => {
    try {
      const response = await api.post(`/customer-documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating documents:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateCustomerDocumentsLinks: async (id, data) => {
    try {
      const response = await api.put(`/customer-documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating documents:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteCustomerDocumentsLinks: async (id) => {
    try {
      const response = await api.delete(`/customer-documents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting documents:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
  getCustomerAllDocuments: async (id) => {
    try {
      const response = await api.get(`/customer/${id}/documents`);
      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return { success: false, data: [] };
    }
  },
  createCustomerAddress: async (data, id) => {
    try {
      const response = await api.post(`/customer/${id}/addresses`, data);

      return response.data;
    } catch (error) {
      console.error("Error creating billing address:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
  updateCustomerAddress: async (id, data) => {
    try {
      const response = await api.put(`/customer/addresses/${id}`, data);

      return response.data;
    } catch (error) {
      console.error("Error updating billing address:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  getClientAddressById: async (id) => {
    try {
      const response = await api.get(`/customer/${id}/addresses`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client address with ID ${id}:`, error);
      return { success: false, data: null };
    }
  },

  updateAddress: async (id, data) => {
    try {
      const response = await api.put(`/addresses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
  deleteAddress: async (id) => {
    try {
      const response = await api.delete(`customer/addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting address:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
  createClient: async (data) => {
    try {
      const response = await api.post("/customer", data);
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
  updateClient: async (id, data) => {
    try {
      const response = await api.put(`/customer/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating client:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/customer/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting client:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
};
