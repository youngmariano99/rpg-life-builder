import { z } from 'zod';

// Validación para Roles
export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres' }),
  description: z
    .string()
    .trim()
    .min(5, { message: 'La descripción debe tener al menos 5 caracteres' })
    .max(200, { message: 'La descripción no puede exceder 200 caracteres' }),
  icon: z.string().min(1, { message: 'Selecciona un icono' }),
  color: z.string().min(1, { message: 'Selecciona un color' }),
});

export type RoleFormData = z.infer<typeof roleSchema>;

// Validación para Misiones/Quests
export const questSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(100, { message: 'El título no puede exceder 100 caracteres' }),
  description: z
    .string()
    .trim()
    .max(300, { message: 'La descripción no puede exceder 300 caracteres' })
    .optional(),
  role_id: z.string().min(1, { message: 'Selecciona un rol' }),
  xp_reward: z
    .number()
    .int({ message: 'La XP debe ser un número entero' })
    .min(10, { message: 'La XP mínima es 10' })
    .max(500, { message: 'La XP máxima es 500' }),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Selecciona una frecuencia válida' }),
  }),
});

export type QuestFormData = z.infer<typeof questSchema>;

// Validación para Objetivos
export const objectiveSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'El título debe tener al menos 5 caracteres' })
    .max(150, { message: 'El título no puede exceder 150 caracteres' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    .max(500, { message: 'La descripción no puede exceder 500 caracteres' }),
  role_id: z.string().optional(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: 'Selecciona un trimestre válido' }),
  }),
  year: z
    .number()
    .int()
    .min(2024, { message: 'El año mínimo es 2024' })
    .max(2030, { message: 'El año máximo es 2030' }),
  xp_reward: z
    .number()
    .int({ message: 'La XP debe ser un número entero' })
    .min(500, { message: 'La XP mínima es 500' })
    .max(10000, { message: 'La XP máxima es 10000' }),
  deadline: z.date({
    required_error: 'Selecciona una fecha límite',
  }),
});

export type ObjectiveFormData = z.infer<typeof objectiveSchema>;

// Validación para Habilidades
export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres' }),
  description: z
    .string()
    .trim()
    .min(5, { message: 'La descripción debe tener al menos 5 caracteres' })
    .max(200, { message: 'La descripción no puede exceder 200 caracteres' }),
  icon: z.string().min(1, { message: 'Selecciona un icono' }),
  cost_xp: z
    .number()
    .int()
    .min(100, { message: 'El costo mínimo es 100 XP' })
    .max(5000, { message: 'El costo máximo es 5000 XP' }),
  cost_money: z
    .number()
    .min(0, { message: 'El costo no puede ser negativo' })
    .optional(),
  cost_time: z
    .string()
    .trim()
    .max(50, { message: 'El tiempo no puede exceder 50 caracteres' })
    .optional(),
  parent_skill_id: z.string().optional(),
});

export type SkillFormData = z.infer<typeof skillSchema>;
