import { api } from '@/lib/api-client';
import { LoginDto, RegisterDto, AuthResponse } from '@/types/auth'; // We need to define these types

const ENDPOINT = '/auth';

export async function login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${ENDPOINT}/login`, data);
    if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: response.userId,
            username: response.username,
            email: response.email
        }));
    }
    return response;
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${ENDPOINT}/register`, data);
    if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: response.userId,
            username: response.username,
            email: response.email
        }));
    }
    return response;
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

export async function getMe(): Promise<any> {
    return api.get('/users/me');
}

export function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
}
