import api from "./api";

export const RouteServices = {
    getAllRoutes: async () => {
        try {
            const response = await api.get("/routes");
            return response.data;
        } catch (error) {
            console.error("Error fetching routes:", error);
            return { success: false, data: [] };
        }
    },
};