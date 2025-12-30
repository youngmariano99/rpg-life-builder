// ==========================================
// LIFE RPG PLANNER - TypeScript Interfaces
// Estos tipos son espejo de las tablas SQL
// ==========================================

// Usuario principal del sistema
export interface IUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  level: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
  mission?: string; // Misión personal
  vision?: string;  // Visión personal
}

// Roles/Clases del personaje (máximo 7)
export interface IRole {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string; // Nombre del icono de lucide-react
  color: string; // Color hex o clase tailwind
  level: number; // 1-100
  current_xp: number;
  xp_to_next_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hábitos/Misiones Diarias (Daily Quests)
export interface IQuest {
  id: string;
  user_id: string;
  role_id: string; // Rol al que pertenece
  title: string;
  description?: string;
  xp_reward: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  is_completed: boolean;
  completed_at?: string;
  streak: number; // Días consecutivos completados
  created_at: string;
  updated_at: string;
}

// Registro de completación de quests
export interface IQuestLog {
  id: string;
  quest_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
}

// Habilidades en el árbol de habilidades
export interface ISkill {
  id: string;
  role_id: string;
  name: string;
  description: string;
  icon: string;
  cost_xp: number;
  cost_money?: number;
  cost_time?: string; // Duración estimada
  is_unlocked: boolean;
  is_available: boolean; // Si puede ser desbloqueada
  parent_skill_id?: string; // Skill requisito
  position_x: number; // Posición en el árbol
  position_y: number;
  created_at: string;
}

// Objetivos trimestrales (Boss Battles)
export interface IObjective {
  id: string;
  user_id: string;
  role_id?: string;
  title: string;
  description: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  xp_reward: number;
  deadline: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Bloques de tiempo (Técnica de la Represa)
export interface ITimeBlock {
  id: string;
  user_id: string;
  role_id?: string;
  title: string;
  description?: string;
  start_time: string; // HH:MM format
  end_time: string;
  day_period: 'morning' | 'afternoon' | 'evening';
  block_type: 'focus' | 'rest' | 'admin';
  is_recurring: boolean;
  days_of_week?: number[]; // 0-6 (Dom-Sab)
  created_at: string;
}

// Inversiones (recursos para objetivos)
export interface IInvestment {
  id: string;
  user_id: string;
  objective_id?: string;
  skill_id?: string;
  title: string;
  type: 'money' | 'time' | 'course' | 'tool' | 'other';
  amount?: number; // Para dinero
  estimated_time?: string; // Para tiempo
  url?: string; // Para cursos/herramientas
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
}

// Temporadas/Campañas (Trimestres)
export interface ICampaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  theme?: string; // Tema narrativo de la temporada
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// Log de XP ganada
export interface IXPLog {
  id: string;
  user_id: string;
  role_id?: string;
  source_type: 'quest' | 'objective' | 'bonus';
  source_id: string;
  xp_amount: number;
  created_at: string;
}

// Estadísticas del usuario
export interface IUserStats {
  total_quests_completed: number;
  current_streak: number;
  longest_streak: number;
  objectives_completed: number;
  total_xp_earned: number;
  hours_focused: number;
}

// Tipos de utilidad para el frontend
export type RoleWithQuests = IRole & {
  quests: IQuest[];
};

export type SkillTreeNode = ISkill & {
  children: SkillTreeNode[];
};

export type DashboardData = {
  user: IUser;
  roles: IRole[];
  todayQuests: IQuest[];
  timeBlocks: ITimeBlock[];
  activeCampaign?: ICampaign;
  stats: IUserStats;
};

// Estado de la aplicación
export interface IAppState {
  user: IUser | null;
  roles: IRole[];
  quests: IQuest[];
  skills: ISkill[];
  objectives: IObjective[];
  timeBlocks: ITimeBlock[];
  campaigns: ICampaign[];
  isLoading: boolean;
  error: string | null;
}
