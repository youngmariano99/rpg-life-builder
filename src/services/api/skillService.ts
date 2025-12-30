// ==========================================
// SKILL SERVICE - Servicio de Habilidades
// Preparado para reemplazo por API .NET
// ==========================================

import { ISkill, SkillTreeNode } from '@/types';
import { mockSkills } from './mockData';

// Simula latencia de red
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene todas las habilidades
 * TODO: Reemplazar con fetch('/api/skills')
 */
export async function getSkills(): Promise<ISkill[]> {
  await simulateDelay();
  return [...mockSkills];
}

/**
 * Obtiene habilidades por rol
 * TODO: Reemplazar con fetch(`/api/skills?roleId=${roleId}`)
 */
export async function getSkillsByRole(roleId: string): Promise<ISkill[]> {
  await simulateDelay();
  return mockSkills.filter(skill => skill.role_id === roleId);
}

/**
 * Obtiene una habilidad por ID
 * TODO: Reemplazar con fetch(`/api/skills/${id}`)
 */
export async function getSkillById(id: string): Promise<ISkill | null> {
  await simulateDelay();
  return mockSkills.find(skill => skill.id === id) || null;
}

/**
 * Construye el árbol de habilidades para un rol
 * TODO: Podría moverse al backend para mejor rendimiento
 */
export async function getSkillTree(roleId: string): Promise<SkillTreeNode[]> {
  await simulateDelay();
  const roleSkills = mockSkills.filter(skill => skill.role_id === roleId);
  
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
 * TODO: Reemplazar con fetch(`/api/skills/${id}/unlock`, { method: 'POST' })
 */
export async function unlockSkill(id: string): Promise<{
  skill: ISkill;
  success: boolean;
  message: string;
}> {
  await simulateDelay();
  
  const skill = mockSkills.find(s => s.id === id);
  if (!skill) {
    return { skill: null as any, success: false, message: 'Habilidad no encontrada' };
  }

  if (skill.is_unlocked) {
    return { skill, success: false, message: 'Habilidad ya desbloqueada' };
  }

  if (!skill.is_available) {
    return { skill, success: false, message: 'Habilidad no disponible aún' };
  }

  // En producción: verificar XP, dinero, tiempo, etc.
  skill.is_unlocked = true;

  // Hacer disponibles las habilidades hijas
  mockSkills
    .filter(s => s.parent_skill_id === id)
    .forEach(s => { s.is_available = true; });

  return { skill, success: true, message: '¡Habilidad desbloqueada!' };
}

/**
 * Crea una nueva habilidad
 * TODO: Reemplazar con fetch('/api/skills', { method: 'POST', body: JSON.stringify(skill) })
 */
export async function createSkill(
  skill: Omit<ISkill, 'id' | 'created_at' | 'is_unlocked' | 'is_available'>
): Promise<ISkill> {
  await simulateDelay();
  const newSkill: ISkill = {
    ...skill,
    id: `skill-${Date.now()}`,
    is_unlocked: false,
    is_available: !skill.parent_skill_id, // Disponible si no tiene padre
    created_at: new Date().toISOString(),
  };
  mockSkills.push(newSkill);
  return newSkill;
}

/**
 * Actualiza una habilidad
 * TODO: Reemplazar con fetch(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
 */
export async function updateSkill(id: string, updates: Partial<ISkill>): Promise<ISkill | null> {
  await simulateDelay();
  const index = mockSkills.findIndex(skill => skill.id === id);
  if (index === -1) return null;
  
  mockSkills[index] = {
    ...mockSkills[index],
    ...updates,
  };
  return mockSkills[index];
}

/**
 * Elimina una habilidad
 * TODO: Reemplazar con fetch(`/api/skills/${id}`, { method: 'DELETE' })
 */
export async function deleteSkill(id: string): Promise<boolean> {
  await simulateDelay();
  const index = mockSkills.findIndex(skill => skill.id === id);
  if (index === -1) return false;
  mockSkills.splice(index, 1);
  return true;
}
