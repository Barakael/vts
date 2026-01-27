import client from './client';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; password_confirmation: string };

export const login = (payload: LoginPayload) => client.post('/login', payload).then(res => res.data);
export const register = (payload: RegisterPayload) => client.post('/register', payload).then(res => res.data);
export const fetchUser = () => client.get('/api/user').then(res => res.data);
export const logout = () => client.post('/logout');
