// ==========================================
// SKILL SERVICE - Servicio de Habilidades
// Conectado a API .NET
// ==========================================

import { ISkill, SkillTreeNode } from '@/types';
import { api } from '@/lib/api-client';

const ENDPOINT = '/skills';

/**
 * Obtiene todas las habilidades
 */
export async function getSkills(): Promise<ISkill[]> {
  return api.get<ISkill[]>(ENDPOINT);
}

/**
 * Obtiene habilidades por rol
 */
export async function getSkillsByRole(roleId: string): Promise<ISkill[]> {
  return api.get<ISkill[]>(`${ENDPOINT}?roleId=${roleId}`);
}

/**
 * Obtiene una habilidad por ID
 */
export async function getSkillById(id: string): Promise<ISkill | null> {
  return api.get<ISkill>(`${ENDPOINT}/${id}`);
}

/**
 * Construye el árbol de habilidades para un rol
 * (Mantiene lógica de transformación en frontend por ahora)
 */
export async function getSkillTree(roleId: string): Promise<SkillTreeNode[]> {
  const roleSkills = await getSkillsByRole(roleId);

  // Construir estructura de árbol
  const skillMap = new Map<string, SkillTreeNode>();
  const roots: SkillTreeNode[] = [];

  // Crear nodos
  roleSkills.forEach(skill => {
    skillMap.set(skill.id, { ...skill, children: [] });
  });

  // Conectar padres con hijos
  roleSkills.forEach(skill => {
    const node = skillMap.get(skill.id)!;
    if (skill.parent_skill_id) {
      const parent = skillMap.get(skill.parent_skill_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Desbloquea una habilidad
 */
export async function unlockSkill(id: string): Promise<{
  skill: ISkill;
  success: boolean;
  message: string;
}> {
  return api.post<{
    skill: ISkill;
    success: boolean;
    message: string;
  }>(`${ENDPOINT}/${id}/unlock`, {});
}

/**
 * Crea una nueva habilidad
 */
export async function createSkill(
  skill: Omit<ISkill, 'id' | 'created_at' | 'is_unlocked' | 'is_available'>
): Promise<ISkill> {
  return api.post<ISkill>(ENDPOINT, skill);
}

/**
 * Actualiza una habilidad
 */
export async function updateSkill(id: string, updates: Partial<ISkill>): Promise<ISkill | null> {
  return api.put<ISkill>(`${ENDPOINT}/${id}`, updates);
}

/**
 * Elimina una habilidad
 */
export async function deleteSkill(id: string): Promise<boolean> {
  await api.delete(`${ENDPOINT}/${id}`);
  return true;
}
