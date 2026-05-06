import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Lỗi: useAuth phải được sử dụng bên trong <AuthProvider>');
  }

  return context;
};

export default useAuth;