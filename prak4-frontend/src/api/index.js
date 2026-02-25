import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "accept": "application/json",
    }
});

export const api = {
    getGoods: async () => {
        let response = await apiClient.get("/goods");
        return response.data;
    },
    getGoodById: async (id) => {
        let response = await apiClient.get(`/goods/${id}`);
        return response.data;
    },
    
    // ← createGood теперь принимает formData и флаг
    createGood: async (data, isFormData = false) => {
        const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
        let response = await apiClient.post("/goods", data, { headers });
        return response.data;
    },
    
    // ← updateGood тоже
    updateGood: async (id, data, isFormData = false) => {
        const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};
        let response = await apiClient.patch(`/goods/${id}`, data, { headers });
        return response.data;
    },
    
    deleteGood: async (id) => {
        let response = await apiClient.delete(`/goods/${id}`);
        return response.data;
    }
};