// ==========================================
// TIME BLOCK SERVICE - Servicio de Bloques de Tiempo
// Conectado a API .NET
// ==========================================

import { ITimeBlock } from '@/types';
import { api } from '@/lib/api-client';

const ENDPOINT = '/time-blocks';

export async function getTimeBlocks(): Promise<ITimeBlock[]> {
    return api.get<ITimeBlock[]>(ENDPOINT);
}

export async function getTimeBlockById(id: string): Promise<ITimeBlock | null> {
    return api.get<ITimeBlock>(`${ENDPOINT}/${id}`);
}

export async function createTimeBlock(timeBlock: Partial<ITimeBlock>): Promise<ITimeBlock> {
    return api.post<ITimeBlock>(ENDPOINT, timeBlock);
}

export async function updateTimeBlock(id: string, updates: Partial<ITimeBlock>): Promise<ITimeBlock> {
    return api.put<ITimeBlock>(`${ENDPOINT}/${id}`, updates);
}

export async function deleteTimeBlock(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
