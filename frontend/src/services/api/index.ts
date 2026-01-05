// ==========================================
// API SERVICES - Punto de entrada principal
// Exporta todos los servicios para fácil acceso
// ==========================================

// Re-exportar datos mock para acceso directo si es necesario
export * from './mockData';

// Servicios de roles/clases
export * from './roleService';

// Servicios de misiones/hábitos
export * from './questService';

// Servicios de habilidades
export * from './skillService';

// Servicios de objetivos
export * from './objectiveService';

// Servicios de bloques de tiempo
export * from './timeBlockService';

// Servicio de autenticación
export * from './authService';
import { getMe } from './authService';

import {
  mockUser,
  mockCampaign,
  mockStats,
  mockInvestments,
} from './mockData';

import { DashboardData } from '@/types';
import { getRoles } from './roleService'; // Import real service
import { getTodayQuests } from './questService'; // Import real service
import { getTimeBlocks } from './timeBlockService'; // Import real service

// Simula latencia de red
const simulateDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene todos los datos del dashboard
 * TODO: Reemplazar con fetch('/api/dashboard') cuando exista el endpoint agregado
 * Por ahora, hacemos llamadas paralelas a los servicios existentes.
 */
export async function getDashboardData(): Promise<DashboardData> {
  // En el futuro: return api.get('/dashboard');

  // Por ahora combinamos datos reales (Roles, Quests, TimeBlocks, User) con mocks (Resto)
  const [roles, todayQuests, timeBlocks, user] = await Promise.all([
    getRoles(),
    getTodayQuests(),
    getTimeBlocks(),
    getMe()
  ]);

  return {
    user: user,     // <--- REAL DATA FROM DB
    roles: roles,   // <--- REAL DATA FROM DB
    todayQuests: todayQuests, // <--- REAL DATA FROM DB
    timeBlocks: timeBlocks, // <--- REAL DATA FROM DB
    activeCampaign: mockCampaign, // Aún Mock
    stats: mockStats, // Aún Mock
  };
}

// getObjectivesByQuarter re-exported from ./objectiveService

// getObjectives re-exported from ./objectiveService

/**
 * Obtiene inversiones
 * TODO: Reemplazar con fetch('/api/investments')
 */
export async function getInvestments() {
  await simulateDelay();
  return [...mockInvestments];
}

// getTimeBlocks re-exported from ./timeBlockService

/**
 * Obtiene campaña activa
 * TODO: Reemplazar con fetch('/api/campaigns/active')
 */
export async function getActiveCampaign() {
  await simulateDelay();
  return mockCampaign;
}

/**
 * Obtiene estadísticas del usuario
 * TODO: Reemplazar con fetch('/api/stats')
 */
export async function getUserStats() {
  await simulateDelay();
  return { ...mockStats };
}
