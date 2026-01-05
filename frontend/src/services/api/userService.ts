import { api } from "@/lib/api-client";

export interface DashboardStats {
    level: number;
    currentXp: number;
    xpToNextLevel: number;
    globalStreak: number;
    focusHoursToday: number;
}

export const userService = {
    getStats: async (): Promise<DashboardStats> => {
        // CORRECCIÓN:
        // 1. Pasamos <DashboardStats> al get para que sepa qué tipo de datos devuelve.
        // 2. Quitamos el .json() porque api.get ya devuelve el objeto listo.
        return api.get<DashboardStats>("/users/me/stats");
    },
};