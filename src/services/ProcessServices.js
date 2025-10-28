import api from "./api";

export const ProcessService = {
  createProcess: async (data) => {
    const response = await api.post("/process", data);
    return response.data;
  },
  getAllProcesses: async (params = {}) => {
    const response = await api.get("/process", { params });
    return response.data;
  },
  getProcessById: async (id) => {
    const response = await api.get(`/process/${id}`);
    return response.data;
  },
  getProcessCustomFields: async (id) => {
    const response = await api.get(`/process/${id}/custom-fields`);
    return response.data;
  },
  deleteProcess: async (id) => {
    const response = await api.delete(`/process/${id}`);
    return response.data;
  },
};

export default ProcessService;
