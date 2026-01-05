export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    userId: string;
    username: string;
    email: string;
}
