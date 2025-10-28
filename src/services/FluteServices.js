import api from "./api";

export const FluteServices = {
    getAllFlutes: async () => {
        try {
            const response = await api.get("/flutes");
            return response.data;
        } catch (error) {
            console.error("Error fetching flutes:", error);
            return { success: false, data: [] };
        }
    },
}