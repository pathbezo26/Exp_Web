import axiosInstance from './axiosInstance';

export const getConversationsAPI = () =>
  axiosInstance.get('/conversations');

export const createConversationAPI = (data) =>
  axiosInstance.post('/conversations', data);
