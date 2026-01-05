// ==========================================
// OBJECTIVE SERVICE - Servicio de Objetivos
// Conectado a API .NET
// ==========================================

import { IObjective } from '@/types';
import { api } from '@/lib/api-client';

const ENDPOINT = '/objectives';

export async function getObjectives(quarter?: string, year?: number): Promise<IObjective[]> {
    const params = new URLSearchParams();
    if (quarter) params.append('quarter', quarter);
    if (year) params.append('year', year.toString());

    return api.get<IObjective[]>(`${ENDPOINT}?${params.toString()}`);
}

export async function getObjectiveById(id: string): Promise<IObjective | null> {
    return api.get<IObjective>(`${ENDPOINT}/${id}`);
}

export async function createObjective(objective: Partial<IObjective>): Promise<IObjective> {
    return api.post<IObjective>(ENDPOINT, objective);
}

export async function updateObjective(id: string, updates: Partial<IObjective>): Promise<IObjective> {
    return api.put<IObjective>(`${ENDPOINT}/${id}`, updates);
}

export async function deleteObjective(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}

export async function completeObjective(id: string): Promise<IObjective> {
    return api.post<IObjective>(`${ENDPOINT}/${id}/complete`, {});
}
