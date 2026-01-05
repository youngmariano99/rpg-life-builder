export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestConfig extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const { token, headers, ...customConfig } = config;

        // Default headers
        const headersMap = new Headers(headers);
        if (!headersMap.has('Content-Type')) {
            headersMap.set('Content-Type', 'application/json');
        }

        // Auth injection
        const storedToken = localStorage.getItem('token');
        if (token || storedToken) {
            headersMap.set('Authorization', `Bearer ${token || storedToken}`);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...customConfig,
            headers: headersMap,
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expirado o inválido
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Evitar loop infinito si ya estamos en login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.title || errorData.message || `API Error: ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    get<T>(endpoint: string, config?: RequestConfig) {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    post<T>(endpoint: string, body: any, config?: RequestConfig) {
        return this.request<T>(endpoint, { ...config, method: 'POST', body: JSON.stringify(body) });
    }

    put<T>(endpoint: string, body: any, config?: RequestConfig) {
        return this.request<T>(endpoint, { ...config, method: 'PUT', body: JSON.stringify(body) });
    }

    delete<T>(endpoint: string, config?: RequestConfig) {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
