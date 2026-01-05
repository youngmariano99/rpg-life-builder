// ==========================================
// ROLE SERVICE - Servicio de Roles/Clases
// Conectado a API .NET
// ==========================================

import { IRole } from '@/types';
import { api } from '@/lib/api-client';

const ENDPOINT = '/roles';

/**
 * Obtiene todos los roles del usuario
 */
export async function getRoles(): Promise<IRole[]> {
  return api.get<IRole[]>(ENDPOINT);
}

/**
 * Obtiene un rol por ID
 */
export async function getRoleById(id: string): Promise<IRole | null> {
  return api.get<IRole>(`${ENDPOINT}/${id}`);
}

/**
 * Crea un nuevo rol
 */
export async function createRole(role: Omit<IRole, 'id' | 'created_at' | 'updated_at'>): Promise<IRole> {
  return api.post<IRole>(ENDPOINT, role);
}

/**
 * Actualiza un rol existente
 */
export async function updateRole(id: string, updates: Partial<IRole>): Promise<IRole | null> {
  return api.put<IRole>(`${ENDPOINT}/${id}`, updates);
}

/**
 * Agrega XP a un rol
 */
export async function addXPToRole(id: string, amount: number): Promise<{ role: IRole; leveledUp: boolean }> {
  // Nota: El backend debe devolver { role, leveledUp } o similar
  // Si el backend solo devuelve el rol actualizado, habrá que ajustar esto.
  // Por ahora asumimos que el endpoint específico de XP devuelve la estructura esperada o el rol.
  // Si el backend backend sigue el estándar REST, tal vez sea un custom endpoint:
  return api.post<{ role: IRole; leveledUp: boolean }>(`${ENDPOINT}/${id}/xp`, { amount });
}

/**
 * Elimina un rol
 */
export async function deleteRole(id: string): Promise<boolean> {
  await api.delete(`${ENDPOINT}/${id}`);
  return true;
}
