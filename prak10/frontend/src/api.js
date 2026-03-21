import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Адрес нашего бэкенда из 9 практики
    headers: {
        'Content-Type': 'application/json',
    }
});

// Перехватчик запросов: автоматически добавляем accessToken
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Перехватчик ответов: если ошибка 401, пробуем обновить токен
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = localStorage.getItem('refreshToken');

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(error);
            }

            try {
                // Запрашиваем новую пару токенов
                const response = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                // Сохраняем новые токены
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Повторяем оригинальный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Если рефреш тоже протух — выкидываем из аккаунта
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;