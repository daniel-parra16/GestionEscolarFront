import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
    const stored = localStorage.getItem("auth");

    if (stored) {
        const { accessToken } = JSON.parse(stored);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }

    return config;
});

export default api;