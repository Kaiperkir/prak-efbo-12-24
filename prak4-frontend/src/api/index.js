import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
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
    createGood: async (good) => {
        let response = await apiClient.post("/goods", good);
        return response.data;
    },
    updateGood: async (id, good) => {
        let response = await apiClient.patch(`/goods/${id}`, good);
        return response.data;
    },
    deleteGood: async (id) => {
        let response = await apiClient.delete(`/goods/${id}`);
        return response.data;
    }
};