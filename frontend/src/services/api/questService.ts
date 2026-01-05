// ==========================================
// QUEST SERVICE - Servicio de Misiones/Hábitos
// Conectado a API .NET
// ==========================================

import { IQuest, IQuestLog } from '@/types';
import { api } from '@/lib/api-client';

const ENDPOINT = '/quests';

/**
 * Obtiene todas las misiones del usuario
 */
export async function getQuests(): Promise<IQuest[]> {
  return api.get<IQuest[]>(ENDPOINT);
}

/**
 * Obtiene misiones del día actual
 */
export async function getTodayQuests(): Promise<IQuest[]> {
  return api.get<IQuest[]>(`${ENDPOINT}/today`);
}

/**
 * Obtiene misiones por rol
 */
export async function getQuestsByRole(roleId: string): Promise<IQuest[]> {
  return api.get<IQuest[]>(`${ENDPOINT}?roleId=${roleId}`);
}

/**
 * Obtiene una misión por ID
 */
export async function getQuestById(id: string): Promise<IQuest | null> {
  return api.get<IQuest>(`${ENDPOINT}/${id}`);
}

/**
 * Crea una nueva misión
 */
export async function createQuest(
  quest: Omit<IQuest, 'id' | 'created_at' | 'updated_at' | 'is_completed' | 'streak'>
): Promise<IQuest> {
  return api.post<IQuest>(ENDPOINT, quest);
}

/**
 * Completa una misión y otorga XP
 */
export async function completeQuest(id: string): Promise<{
  quest: IQuest;
  xpEarned: number;
  leveledUp: boolean;
  questLog: IQuestLog;
}> {
  // El backend calcula todo y retorna el resultado
  return api.post<{
    quest: IQuest;
    xpEarned: number;
    leveledUp: boolean;
    questLog: IQuestLog;
  }>(`${ENDPOINT}/${id}/complete`, {});
}

/**
 * Desmarca una misión como completada
 */
export async function uncompleteQuest(id: string): Promise<IQuest> {
  return api.post<IQuest>(`${ENDPOINT}/${id}/uncomplete`, {});
}

/**
 * Actualiza una misión
 */
export async function updateQuest(id: string, updates: Partial<IQuest>): Promise<IQuest | null> {
  return api.put<IQuest>(`${ENDPOINT}/${id}`, updates);
}

/**
 * Elimina una misión
 */
export async function deleteQuest(id: string): Promise<boolean> {
  await api.delete(`${ENDPOINT}/${id}`);
  return true;
}

/**
 * Reinicia las misiones diarias (para nuevo día)
 */
export async function resetDailyQuests(): Promise<void> {
  return api.post(`${ENDPOINT}/reset-daily`, {});
}
