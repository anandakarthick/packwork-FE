import api from "./api";

export const TaxServices = {
    getAllTaxes: async () => {
        try {
            const response = await api.get("/taxmasters");
            return response.data;
        } catch (error) {
            console.error("Error fetching taxes:", error);
            return { success: false, data: [] };
        }
    },
};