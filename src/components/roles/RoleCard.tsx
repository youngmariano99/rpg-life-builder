import { motion } from 'framer-motion';
import { IRole } from '@/types';
import { XPBar } from '@/components/shared/XPBar';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  role: IRole;
  onClick?: () => void;
  isSelected?: boolean;
}

export const RoleCard = ({ role, onClick, isSelected }: RoleCardProps) => {
  // Dynamic icon loading
  const IconComponent = (LucideIcons as any)[role.icon] || LucideIcons.Star;

  const colorClasses: Record<string, string> = {
    primary: 'border-primary/50 hover:border-primary',
    secondary: 'border-secondary/50 hover:border-secondary',
    destructive: 'border-destructive/50 hover:border-destructive',
    success: 'border-success/50 hover:border-success',
    accent: 'border-accent/50 hover:border-accent',
  };

  const glowClasses: Record<string, string> = {
    primary: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]',
    secondary: 'hover:shadow-[0_0_30px_hsl(var(--secondary)/0.4)]',
    destructive: 'hover:shadow-[0_0_30px_hsl(var(--destructive)/0.4)]',
    success: 'hover:shadow-[0_0_30px_hsl(var(--success)/0.4)]',
    accent: 'hover:shadow-[0_0_30px_hsl(var(--accent)/0.4)]',
  };

  const iconColorClasses: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    destructive: 'text-destructive',
    success: 'text-success',
    accent: 'text-accent',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer p-6 rounded-xl border-2 bg-card/80 backdrop-blur-sm',
        'transition-all duration-300',
        colorClasses[role.color] || colorClasses.primary,
        glowClasses[role.color] || glowClasses.primary,
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Top glow line */}
      <div
        className={cn(
          'absolute top-0 left-4 right-4 h-px',
          role.color === 'primary' && 'bg-gradient-to-r from-transparent via-primary/50 to-transparent',
          role.color === 'secondary' && 'bg-gradient-to-r from-transparent via-secondary/50 to-transparent',
          role.color === 'destructive' && 'bg-gradient-to-r from-transparent via-destructive/50 to-transparent',
          role.color === 'success' && 'bg-gradient-to-r from-transparent via-success/50 to-transparent',
          role.color === 'accent' && 'bg-gradient-to-r from-transparent via-accent/50 to-transparent'
        )}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'p-3 rounded-lg bg-muted/50 border border-border/50',
            iconColorClasses[role.color] || iconColorClasses.primary
          )}
        >
          <IconComponent className="h-8 w-8" />
        </div>
        <div className="text-right">
          <div className="font-orbitron text-3xl font-bold text-foreground">
            {role.level}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Nivel
          </div>
        </div>
      </div>

      {/* Name and Description */}
      <h3 className="font-orbitron text-lg font-semibold text-foreground mb-1">
        {role.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {role.description}
      </p>

      {/* XP Bar */}
      <XPBar
        currentXP={role.current_xp}
        maxXP={role.xp_to_next_level}
        level={role.level}
        size="sm"
      />

      {/* Bottom decoration */}
      <div className="absolute bottom-3 right-3">
        <LucideIcons.ChevronRight className="h-5 w-5 text-muted-foreground/50" />
      </div>
    </motion.div>
  );
};
