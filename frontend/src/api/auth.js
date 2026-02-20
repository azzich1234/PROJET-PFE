import client from './client';

export const registerUser = (data) => client.post('/register', data);
export const loginUser    = (data) => client.post('/login', data);
export const logoutUser      = ()     => client.post('/logout');
export const getUser         = ()     => client.get('/user');
export const forgotPassword  = (data) => client.post('/forgot-password', data);
export const resetPassword   = (data) => client.post('/reset-password', data);

export const updateProfile   = (data) => client.put('/profile', data);
export const updatePassword  = (data) => client.put('/profile/password', data);
export const uploadAvatar    = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return client.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const removeAvatar    = ()     => client.delete('/profile/avatar');

// Admin
export const getUsers          = (params) => client.get('/admin/users', { params });
export const toggleUserActive  = (id)     => client.patch(`/admin/users/${id}/toggle`);
export const addInstructor     = (data)   => client.post('/admin/users', data);
export const updateUser        = (id, data) => client.put(`/admin/users/${id}`, data);
export const deleteUser        = (id)     => client.delete(`/admin/users/${id}`);
