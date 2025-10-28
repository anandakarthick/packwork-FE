import api from "./api";

export const ColorServices = {
    getAllColors: async () => {
        try {
            const response = await api.get("/colors");
            return response.data;
        } catch (error) {
            console.error("Error fetching colors:", error);
            return { success: false, data: [] };
        }
    },
};