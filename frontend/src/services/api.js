import axios from 'axios';

const api = axios.create({
    baseURL: '/',
});

export const getPhotos = async (skip = 0, limit = 100) => {
    const response = await api.get(`/photos?skip=${skip}&limit=${limit}`);
    return response.data;
};

export const getPhotoById = async (id) => {
    const response = await api.get(`/photos/${id}`);
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
};

export const getCities = async () => {
    // Note: Novaposhta API via the backend gets *all* cities.
    const response = await api.get(`/api/novaposhta/all-cities`);
    return response.data;
};

export const getWarehouses = async (cityRef) => {
    // Note: Novaposhta API via the backend expects a POST with cityRef
    const response = await api.post(`/api/novaposhta/warehouses`, { cityRef });
    return response.data;
};

export const loginAdmin = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const response = await api.post('/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const uploadPhoto = async (formData, token) => {
    const response = await api.post('/photos', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deletePhoto = async (id, token) => {
    const response = await api.delete(`/photos/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export default api;
