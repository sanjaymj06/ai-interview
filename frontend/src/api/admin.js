import axios from './axios';

export const getUsers = (params) => axios.get('/admin/users', { params });
export const updateUser = (id, data) => axios.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`/admin/users/${id}`);
export const getAnalytics = () => axios.get('/admin/analytics');
export const getLogs = (params) => axios.get('/admin/logs', { params });
export const exportReports = (format = 'csv') =>
  axios.get('/admin/export', {
    params: { format },
    responseType: 'blob',
  });
