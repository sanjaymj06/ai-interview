import axios from './axios';

export const getStats = () => axios.get('/dashboard/stats');
export const getCharts = () => axios.get('/dashboard/charts');
export const getRecent = () => axios.get('/dashboard/recent');
