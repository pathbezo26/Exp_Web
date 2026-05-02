import axiosInstance from './axiosInstance';

export const getMessagesAPI = (conversationId) =>
  axiosInstance.get(`/messages/${conversationId}`);

export const saveMessageAPI = (data) =>
  axiosInstance.post('/messages', data);
