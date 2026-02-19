import client from './client';

export const registerUser = (data) => client.post('/register', data);
export const loginUser    = (data) => client.post('/login', data);
export const logoutUser   = ()     => client.post('/logout');
export const getUser      = ()     => client.get('/user');
