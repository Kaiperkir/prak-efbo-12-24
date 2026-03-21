import axios from "axios";

const instance = axios.create({ baseURL: "http://localhost:3000" });

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

instance.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const res = await axios.post("http://localhost:3000/api/auth/refresh", { refreshToken });
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return instance(originalRequest);
        } catch (err) {
            localStorage.clear();
        }
    }
    return Promise.reject(error);
});

export const api = {
    getGoods: () => instance.get("/goods").then(r => r.data),
    createGood: (data, isForm) => instance.post("/goods", data, { headers: { "Content-Type": isForm ? "multipart/form-data" : "application/json" } }),
    updateGood: (id, data, isForm) => instance.patch(`/goods/${id}`, data, { headers: { "Content-Type": isForm ? "multipart/form-data" : "application/json" } }),
    deleteGood: (id) => instance.delete(`/goods/${id}`),
    
    login: (data) => instance.post("/api/auth/login", data).then(r => r.data),
    register: (data) => instance.post("/api/auth/register", data).then(r => r.data),
    getMe: () => instance.get("/api/auth/me").then(r => r.data),
    getUsers: () => instance.get("/api/users").then(r => r.data),
    deleteUser: (id) => instance.delete(`/api/users/${id}`)
};