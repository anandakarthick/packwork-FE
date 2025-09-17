import api from "./api";

export const ProductService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return { success: false, data: null };
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/products", data);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, message: error.response?.data?.message };
    }
  },
};
