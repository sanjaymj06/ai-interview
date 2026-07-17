import axios from './axios';

export const register = (data) => axios.post('/auth/register', data);
export const login = (data) => axios.post('/auth/login', data);
export const logout = () => axios.post('/auth/logout');
export const forgotPassword = (email) => axios.post('/auth/forgot-password', { email });
export const resetPassword = (data) => axios.post('/auth/reset-password', data);
export const getProfile = () => axios.get('/auth/profile');
export const updateProfile = (data) => axios.put('/auth/profile', data);
export const changePassword = (data) => axios.put('/auth/change-password', data);
export const uploadAvatar = (formData) =>
  axios.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
