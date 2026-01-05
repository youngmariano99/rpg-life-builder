import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { IQuest, IRole } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { XPAnimation } from '@/components/shared/XPAnimation';
import { Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestItemProps {
  quest: IQuest;
  role?: IRole;
  onComplete: (questId: string) => Promise<void>;
}

export const QuestItem = ({ quest, role, onComplete }: QuestItemProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [isCompleted, setIsCompleted] = useState(quest.is_completed);

  const handleComplete = async () => {
    if (isCompleted || isCompleting) return;

    setIsCompleting(true);
    setShowXP(true);

    try {
      await onComplete(quest.id);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completando misión:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm',
        'transition-all duration-300',
        isCompleted
          ? 'border-success/30 bg-success/5'
          : 'border-border/30 hover:border-primary/30 hover:bg-card/80'
      )}
    >
      {/* XP Animation */}
      <AnimatePresence>
        {showXP && (
          <XPAnimation
            amount={quest.xp_reward}
            onComplete={() => setShowXP(false)}
          />
        )}
      </AnimatePresence>

      {/* Checkbox */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        className="relative"
      >
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleComplete}
          disabled={isCompleting}
          className={cn(
            'h-6 w-6 rounded-md border-2 transition-all duration-300',
            isCompleted
              ? 'border-success bg-success text-success-foreground'
              : 'border-muted-foreground/50 hover:border-primary'
          )}
        />
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-3 w-3 text-accent" />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={cn(
              'font-rajdhani font-semibold text-base transition-all duration-300',
              isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
            )}
          >
            {quest.title}
          </h4>
          {quest.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30">
              <Flame className="h-3 w-3 text-accent" />
              <span className="text-xs font-orbitron text-accent">
                {quest.streak}
              </span>
            </div>
          )}
        </div>
        {quest.description && (
          <p className="text-sm text-muted-foreground truncate">
            {quest.description}
          </p>
        )}
      </div>

      {/* XP Reward */}
      <div className="flex flex-col items-end">
        <div
          className={cn(
            'font-orbitron text-sm font-bold',
            isCompleted ? 'text-success' : 'text-accent'
          )}
        >
          +{quest.xp_reward} XP
        </div>
        {role && (
          <div className="text-xs text-muted-foreground">{role.name}</div>
        )}
      </div>

      {/* Completion glow effect */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 20px hsl(var(--success) / 0.1)',
          }}
        />
      )}
    </motion.div>
  );
};
