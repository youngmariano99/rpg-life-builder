// ==========================================
// QUEST SERVICE - Servicio de Misiones/Hábitos
// Preparado para reemplazo por API .NET
// ==========================================

import { IQuest, IQuestLog } from '@/types';
import { mockQuests } from './mockData';
import { addXPToRole } from './roleService';

// Simula latencia de red
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene todas las misiones del usuario
 * TODO: Reemplazar con fetch('/api/quests')
 */
export async function getQuests(): Promise<IQuest[]> {
  await simulateDelay();
  return [...mockQuests];
}

/**
 * Obtiene misiones del día actual
 * TODO: Reemplazar con fetch('/api/quests/today')
 */
export async function getTodayQuests(): Promise<IQuest[]> {
  await simulateDelay();
  // En producción, filtrar por fecha y frecuencia
  return mockQuests.filter(q => q.frequency === 'daily' || q.frequency === 'weekly');
}

/**
 * Obtiene misiones por rol
 * TODO: Reemplazar con fetch(`/api/quests?roleId=${roleId}`)
 */
export async function getQuestsByRole(roleId: string): Promise<IQuest[]> {
  await simulateDelay();
  return mockQuests.filter(quest => quest.role_id === roleId);
}

/**
 * Obtiene una misión por ID
 * TODO: Reemplazar con fetch(`/api/quests/${id}`)
 */
export async function getQuestById(id: string): Promise<IQuest | null> {
  await simulateDelay();
  return mockQuests.find(quest => quest.id === id) || null;
}

/**
 * Crea una nueva misión
 * TODO: Reemplazar con fetch('/api/quests', { method: 'POST', body: JSON.stringify(quest) })
 */
export async function createQuest(
  quest: Omit<IQuest, 'id' | 'created_at' | 'updated_at' | 'is_completed' | 'streak'>
): Promise<IQuest> {
  await simulateDelay();
  const newQuest: IQuest = {
    ...quest,
    id: `quest-${Date.now()}`,
    is_completed: false,
    streak: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockQuests.push(newQuest);
  return newQuest;
}

/**
 * Completa una misión y otorga XP
 * TODO: Reemplazar con fetch(`/api/quests/${id}/complete`, { method: 'POST' })
 */
export async function completeQuest(id: string): Promise<{
  quest: IQuest;
  xpEarned: number;
  leveledUp: boolean;
  questLog: IQuestLog;
}> {
  await simulateDelay();
  
  const quest = mockQuests.find(q => q.id === id);
  if (!quest) throw new Error('Misión no encontrada');
  if (quest.is_completed) throw new Error('Misión ya completada');

  // Marcar como completada
  quest.is_completed = true;
  quest.completed_at = new Date().toISOString();
  quest.streak += 1;
  quest.updated_at = new Date().toISOString();

  // Agregar XP al rol
  const { leveledUp } = await addXPToRole(quest.role_id, quest.xp_reward);

  // Crear log de la misión
  const questLog: IQuestLog = {
    id: `log-${Date.now()}`,
    quest_id: quest.id,
    user_id: quest.user_id,
    completed_at: new Date().toISOString(),
    xp_earned: quest.xp_reward,
  };

  return {
    quest,
    xpEarned: quest.xp_reward,
    leveledUp,
    questLog,
  };
}

/**
 * Desmarca una misión como completada
 * TODO: Reemplazar con fetch(`/api/quests/${id}/uncomplete`, { method: 'POST' })
 */
export async function uncompleteQuest(id: string): Promise<IQuest> {
  await simulateDelay();
  
  const quest = mockQuests.find(q => q.id === id);
  if (!quest) throw new Error('Misión no encontrada');

  quest.is_completed = false;
  quest.completed_at = undefined;
  quest.updated_at = new Date().toISOString();

  return quest;
}

/**
 * Actualiza una misión
 * TODO: Reemplazar con fetch(`/api/quests/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
 */
export async function updateQuest(id: string, updates: Partial<IQuest>): Promise<IQuest | null> {
  await simulateDelay();
  const index = mockQuests.findIndex(quest => quest.id === id);
  if (index === -1) return null;
  
  mockQuests[index] = {
    ...mockQuests[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mockQuests[index];
}

/**
 * Elimina una misión
 * TODO: Reemplazar con fetch(`/api/quests/${id}`, { method: 'DELETE' })
 */
export async function deleteQuest(id: string): Promise<boolean> {
  await simulateDelay();
  const index = mockQuests.findIndex(quest => quest.id === id);
  if (index === -1) return false;
  mockQuests.splice(index, 1);
  return true;
}

/**
 * Reinicia las misiones diarias (para nuevo día)
 * TODO: Reemplazar con fetch('/api/quests/reset-daily', { method: 'POST' })
 */
export async function resetDailyQuests(): Promise<void> {
  await simulateDelay();
  mockQuests.forEach(quest => {
    if (quest.frequency === 'daily') {
      quest.is_completed = false;
      quest.completed_at = undefined;
      quest.updated_at = new Date().toISOString();
    }
  });
}
