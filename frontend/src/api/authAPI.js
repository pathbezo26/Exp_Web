import axiosInstance from './axiosInstance';

// Đăng ký tài khoản mới
// data: { username, email, password }
export const registerAPI = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data; // { message, token, user }
};

// Đăng nhập
// data: { email, password }
export const loginAPI = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data; // { message, token, user }
};

// Lấy thông tin user hiện tại (dùng khi reload trang)
export const getMeAPI = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data; // { user }
};