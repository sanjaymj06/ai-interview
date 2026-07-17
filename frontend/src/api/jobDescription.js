import axios from './axios';

export const createJobDescription = (data) => axios.post('/job-descriptions', data);
export const getJobDescriptions = (params) => axios.get('/job-descriptions', { params });
export const getJobDescription = (id) => axios.get(`/job-descriptions/${id}`);
export const updateJobDescription = (id, data) => axios.put(`/job-descriptions/${id}`, data);
export const deleteJobDescription = (id) => axios.delete(`/job-descriptions/${id}`);
