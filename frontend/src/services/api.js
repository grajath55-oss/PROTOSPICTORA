import axios from 'axios';

// 🔴 FIX: hard-set local backend
const BACKEND_URL = 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Images API
export const getImages = async (params = {}) => {
  const response = await axios.get(`${API}/images`, { params });
  return response.data;
};

export const getImage = async (imageId) => {
  const response = await axios.get(`${API}/images/${imageId}`);
  return response.data;
};

export const uploadImage = async (formData) => {
  const response = await axios.post(`${API}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Users API
export const getUser = async (userId) => {
  const response = await axios.get(`${API}/users/${userId}`);
  return response.data;
};

export const getUserUploads = async (userId) => {
  const response = await axios.get(`${API}/users/${userId}/uploads`);
  return response.data;
};

export const getUserPurchases = async (userId) => {
  const response = await axios.get(`${API}/users/${userId}/purchases`);
  return response.data;
};

// Purchases API
export const createPurchase = async (purchaseData) => {
  const response = await axios.post(`${API}/purchases`, purchaseData);
  return response.data;
};

export const getBulkRecommendations = async (requestData) => {
  const response = await axios.post(`${API}/bulk-recommend`, requestData);
  return response.data;
};

// Favorites API
export const addFavorite = async (favoriteData) => {
  const response = await axios.post(`${API}/favorites`, favoriteData);
  return response.data;
};

export const removeFavorite = async (imageId, userId) => {
  const response = await axios.delete(
    `${API}/favorites/${imageId}?user_id=${userId}`
  );
  return response.data;
};

export const getFavorites = async (userId) => {
  const response = await axios.get(`${API}/favorites?user_id=${userId}`);
  return response.data;
};
// ---------- AUTH API ----------
const AUTH_API = "http://localhost:8000/api/auth";
export const registerUser = async (data) => {
  const res = await axios.post(`${AUTH_API}/register`, data);
  return res.data;
};


export const loginUser = async (data) => {
  const res = await axios.post(`${AUTH_API}/login`, data);
  return res.data;
};
