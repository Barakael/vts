import client from './client';
import type { UserResponse } from '../types/telemetry';

const API_PREFIX = '/api';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string; password_confirmation: string };

const ensureCsrf = async (): Promise<void> => {
	try {
		const response = await client.get('/sanctum/csrf-cookie');
		// Wait a bit for the cookie to be set
		await new Promise(resolve => setTimeout(resolve, 200));
		return response.data;
	} catch (error) {
		console.error('Failed to get CSRF token:', error);
		throw new Error('Failed to obtain CSRF token');
	}
};

export const login = async (payload: LoginPayload) => {
	console.log('Starting login process...');
	
	try {
		console.log('Getting CSRF token...');
		await ensureCsrf();
		console.log('CSRF token obtained');
		
		console.log('Making login request...');
		const response = await client.post(`${API_PREFIX}/login`, payload);
		console.log('Login successful:', response.data);
		
		return response.data;
	} catch (error: any) {
		console.error('Login failed:', error.response?.data || error.message);
		throw error;
	}
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
