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

// Importar y re-exportar funciones principales
import { 
  mockUser, 
  mockRoles, 
  mockQuests, 
  mockSkills, 
  mockObjectives,
  mockTimeBlocks,
  mockCampaign,
  mockStats,
  mockInvestments,
} from './mockData';

import { DashboardData } from '@/types';

// Simula latencia de red
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene todos los datos del dashboard
 * TODO: Reemplazar con fetch('/api/dashboard')
 */
export async function getDashboardData(): Promise<DashboardData> {
  await simulateDelay(500);
  return {
    user: mockUser,
    roles: mockRoles,
    todayQuests: mockQuests.filter(q => q.frequency === 'daily'),
    timeBlocks: mockTimeBlocks,
    activeCampaign: mockCampaign,
    stats: mockStats,
  };
}

/**
 * Obtiene objetivos por trimestre
 * TODO: Reemplazar con fetch(`/api/objectives?quarter=${quarter}&year=${year}`)
 */
export async function getObjectivesByQuarter(quarter: string, year: number) {
  await simulateDelay();
  return mockObjectives.filter(obj => obj.quarter === quarter && obj.year === year);
}

/**
 * Obtiene todos los objetivos
 * TODO: Reemplazar con fetch('/api/objectives')
 */
export async function getObjectives() {
  await simulateDelay();
  return [...mockObjectives];
}

/**
 * Obtiene inversiones
 * TODO: Reemplazar con fetch('/api/investments')
 */
export async function getInvestments() {
  await simulateDelay();
  return [...mockInvestments];
}

/**
 * Obtiene bloques de tiempo
 * TODO: Reemplazar con fetch('/api/time-blocks')
 */
export async function getTimeBlocks() {
  await simulateDelay();
  return [...mockTimeBlocks];
}

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
