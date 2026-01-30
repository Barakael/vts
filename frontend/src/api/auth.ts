import client from './client';
import type { UserResponse } from '../types/telemetry';

const API_PREFIX = '/api';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; password_confirmation: string };

const ensureCsrf = () => client.get('/sanctum/csrf-cookie');

export const login = async (payload: LoginPayload) => {
	await ensureCsrf();
	return client.post(`${API_PREFIX}/login`, payload).then(res => res.data);
};

export const register = async (payload: RegisterPayload) => {
	await ensureCsrf();
	return client.post(`${API_PREFIX}/register`, payload).then(res => res.data);
};

export const fetchUser = () => client.get<UserResponse>(`${API_PREFIX}/user`).then(res => res.data);

export const logout = async () => {
	await ensureCsrf();
	return client.post(`${API_PREFIX}/logout`);
};
