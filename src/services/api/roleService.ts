// ==========================================
// ROLE SERVICE - Servicio de Roles/Clases
// Preparado para reemplazo por API .NET
// ==========================================

import { IRole } from '@/types';
import { mockRoles } from './mockData';

// Simula latencia de red
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene todos los roles del usuario
 * TODO: Reemplazar con fetch('/api/roles')
 */
export async function getRoles(): Promise<IRole[]> {
  await simulateDelay();
  return [...mockRoles];
}

/**
 * Obtiene un rol por ID
 * TODO: Reemplazar con fetch(`/api/roles/${id}`)
 */
export async function getRoleById(id: string): Promise<IRole | null> {
  await simulateDelay();
  return mockRoles.find(role => role.id === id) || null;
}

/**
 * Crea un nuevo rol
 * TODO: Reemplazar con fetch('/api/roles', { method: 'POST', body: JSON.stringify(role) })
 */
export async function createRole(role: Omit<IRole, 'id' | 'created_at' | 'updated_at'>): Promise<IRole> {
  await simulateDelay();
  const newRole: IRole = {
    ...role,
    id: `role-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockRoles.push(newRole);
  return newRole;
}

/**
 * Actualiza un rol existente
 * TODO: Reemplazar con fetch(`/api/roles/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
 */
export async function updateRole(id: string, updates: Partial<IRole>): Promise<IRole | null> {
  await simulateDelay();
  const index = mockRoles.findIndex(role => role.id === id);
  if (index === -1) return null;
  
  mockRoles[index] = {
    ...mockRoles[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mockRoles[index];
}

/**
 * Agrega XP a un rol
 * TODO: Reemplazar con fetch(`/api/roles/${id}/xp`, { method: 'POST', body: JSON.stringify({ amount }) })
 */
export async function addXPToRole(id: string, amount: number): Promise<{ role: IRole; leveledUp: boolean }> {
  await simulateDelay();
  const role = mockRoles.find(r => r.id === id);
  if (!role) throw new Error('Rol no encontrado');

  let newXP = role.current_xp + amount;
  let newLevel = role.level;
  let leveledUp = false;

  // Verificar subida de nivel
  while (newXP >= role.xp_to_next_level) {
    newXP -= role.xp_to_next_level;
    newLevel++;
    leveledUp = true;
  }

  role.current_xp = newXP;
  role.level = newLevel;
  role.updated_at = new Date().toISOString();

  return { role, leveledUp };
}

/**
 * Elimina un rol
 * TODO: Reemplazar con fetch(`/api/roles/${id}`, { method: 'DELETE' })
 */
export async function deleteRole(id: string): Promise<boolean> {
  await simulateDelay();
  const index = mockRoles.findIndex(role => role.id === id);
  if (index === -1) return false;
  mockRoles.splice(index, 1);
  return true;
}
