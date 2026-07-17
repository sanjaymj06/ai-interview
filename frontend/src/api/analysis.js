import axios from './axios';

export const runAnalysis = (data) => axios.post('/analyses/run', data);
export const getAnalysis = (id) => axios.get(`/analyses/${id}`);
export const getAnalysisHistory = (params) => axios.get('/analyses', { params });
export const deleteAnalysis = (id) => axios.delete(`/analyses/${id}`);
export const exportReport = (id, format = 'pdf') =>
  axios.get(`/analyses/${id}/export`, {
    params: { format },
    responseType: 'blob',
  });
