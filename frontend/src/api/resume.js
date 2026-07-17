import axios from './axios';

export const uploadResume = (formData) =>
  axios.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getResumes = (params) => axios.get('/resumes', { params });
export const getResume = (id) => axios.get(`/resumes/${id}`);
export const deleteResume = (id) => axios.delete(`/resumes/${id}`);
export const getParsedResume = (id) => axios.get(`/resumes/${id}/parsed`);
export const updateResume = (id, data) => axios.put(`/resumes/${id}`, data);
