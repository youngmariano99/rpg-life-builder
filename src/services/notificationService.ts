import { IQuest, IObjective } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos de notificación
export type NotificationType = 
  | 'quest_reminder'
  | 'streak_warning'
  | 'level_up'
  | 'objective_deadline'
  | 'daily_summary'
  | 'achievement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

// Almacenamiento local de notificaciones
let notifications: Notification[] = [];
let notificationListeners: ((notifications: Notification[]) => void)[] = [];

const notifyListeners = () => {
  notificationListeners.forEach(listener => listener([...notifications]));
};

export const subscribeToNotifications = (
  listener: (notifications: Notification[]) => void
) => {
  notificationListeners.push(listener);
  listener([...notifications]); // Initial call
  
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== listener);
  };
};

export const addNotification = (
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Notification => {
  const notification: Notification = {
    id: `notif-${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    data,
  };
  
  notifications = [notification, ...notifications].slice(0, 50); // Keep last 50
  notifyListeners();
  
  return notification;
};

export const markAsRead = (id: string) => {
  notifications = notifications.map(n =>
    n.id === id ? { ...n, read: true } : n
  );
  notifyListeners();
};

export const markAllAsRead = () => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  notifyListeners();
};

export const clearNotifications = () => {
  notifications = [];
  notifyListeners();
};

export const getUnreadCount = () => notifications.filter(n => !n.read).length;

// Toast notifications con estilos personalizados
export const showQuestReminder = (quest: IQuest) => {
  const notif = addNotification(
    'quest_reminder',
    '¡Misión pendiente!',
    `No olvides: "${quest.title}"`,
    { questId: quest.id, xp: quest.xp_reward }
  );

  toast.warning(`¡Misión pendiente!`, {
    description: `"${quest.title}" te espera (+${quest.xp_reward} XP)`,
    duration: 5000,
    action: {
      label: 'Ver',
      onClick: () => {
        // Could scroll to quest or open detail
        markAsRead(notif.id);
      },
    },
  });
};

export const showStreakWarning = (currentStreak: number) => {
  const notif = addNotification(
    'streak_warning',
    '⚠️ ¡Protege tu racha!',
    `Tu racha de ${currentStreak} días está en peligro`,
    { streak: currentStreak }
  );

  toast.error('¡Tu racha está en peligro!', {
    description: `Completa al menos una misión para mantener tu racha de ${currentStreak} días`,
    duration: 8000,
    icon: '🔥',
  });
};

export const showLevelUpNotification = (roleName: string, newLevel: number) => {
  const notif = addNotification(
    'level_up',
    '¡SUBIDA DE NIVEL!',
    `${roleName} ha alcanzado el nivel ${newLevel}`,
    { roleName, level: newLevel }
  );

  toast.success(`¡${roleName} subió al nivel ${newLevel}!`, {
    description: '¡Sigue así, campeón!',
    duration: 6000,
    icon: '⚡',
  });
};

export const showObjectiveDeadlineWarning = (objective: IObjective) => {
  const deadline = new Date(objective.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const notif = addNotification(
    'objective_deadline',
    '📅 Fecha límite cercana',
    `"${objective.title}" vence en ${daysLeft} días`,
    { objectiveId: objective.id, deadline: objective.deadline }
  );

  toast.warning(`Objetivo próximo a vencer`, {
    description: `"${objective.title}" - ${daysLeft} días restantes`,
    duration: 7000,
  });
};

export const showDailySummary = (
  completedQuests: number,
  totalQuests: number,
  xpEarned: number
) => {
  const percentage = totalQuests > 0 
    ? Math.round((completedQuests / totalQuests) * 100) 
    : 0;
  
  const notif = addNotification(
    'daily_summary',
    '📊 Resumen del día',
    `${completedQuests}/${totalQuests} misiones (${percentage}%) - ${xpEarned} XP`,
    { completed: completedQuests, total: totalQuests, xp: xpEarned }
  );

  if (percentage === 100) {
    toast.success('¡Día perfecto!', {
      description: `Completaste todas las misiones (+${xpEarned} XP)`,
      duration: 6000,
      icon: '🏆',
    });
  } else if (percentage >= 75) {
    toast.success('¡Buen trabajo!', {
      description: `${completedQuests}/${totalQuests} misiones completadas`,
      duration: 5000,
      icon: '💪',
    });
  } else if (percentage >= 50) {
    toast.info('Progreso decente', {
      description: `${completedQuests}/${totalQuests} misiones - ¡Puedes hacerlo mejor!`,
      duration: 5000,
    });
  } else {
    toast.warning('¡Aún hay tiempo!', {
      description: `Solo ${completedQuests}/${totalQuests} misiones - ¡Termina fuerte!`,
      duration: 5000,
    });
  }
};

export const showAchievementUnlocked = (achievementName: string, description: string) => {
  const notif = addNotification(
    'achievement',
    '🏅 ¡Logro desbloqueado!',
    achievementName,
    { achievement: achievementName }
  );

  toast.success(achievementName, {
    description,
    duration: 8000,
    icon: '🏅',
  });
};

export const showQuestCompleted = (questTitle: string, xpReward: number) => {
  toast.success('¡Misión completada!', {
    description: `"${questTitle}" +${xpReward} XP`,
    duration: 3000,
    icon: '✅',
  });
};

export const showMotivationalMessage = () => {
  const messages = [
    { title: '¡Ánimo!', message: 'Cada pequeño paso te acerca a tus metas' },
    { title: '¡Tú puedes!', message: 'Los héroes se forjan con disciplina diaria' },
    { title: '¡Sigue adelante!', message: 'La constancia vence al talento' },
    { title: '¡Gran trabajo!', message: 'Estás construyendo tu mejor versión' },
    { title: '¡No te rindas!', message: 'Las batallas difíciles forjan guerreros fuertes' },
  ];
  
  const random = messages[Math.floor(Math.random() * messages.length)];
  
  toast.info(random.title, {
    description: random.message,
    duration: 4000,
    icon: '💫',
  });
};

// Check for pending reminders
export const checkPendingReminders = (
  quests: IQuest[],
  objectives: IObjective[],
  currentStreak: number
) => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Contar misiones pendientes
  const pendingQuests = quests.filter(q => !q.is_completed);
  const completedToday = quests.filter(q => q.is_completed).length;
  
  // Recordatorio de mañana (9 AM)
  if (currentHour === 9 && pendingQuests.length > 0) {
    toast.info('☀️ ¡Buenos días, Héroe!', {
      description: `Tienes ${pendingQuests.length} misiones esperándote hoy`,
      duration: 6000,
    });
  }
  
  // Recordatorio de medio día (13:00)
  if (currentHour === 13 && pendingQuests.length > 0 && completedToday === 0) {
    showMotivationalMessage();
  }
  
  // Recordatorio de tarde (18:00) - alerta de racha
  if (currentHour === 18 && completedToday === 0 && currentStreak > 0) {
    showStreakWarning(currentStreak);
  }
  
  // Verificar objetivos próximos a vencer (7 días o menos)
  objectives
    .filter(obj => obj.status === 'in_progress')
    .forEach(obj => {
      const deadline = new Date(obj.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7 && daysLeft > 0) {
        // Solo mostrar una vez al día (a las 10 AM)
        if (currentHour === 10) {
          showObjectiveDeadlineWarning(obj);
        }
      }
    });
};
