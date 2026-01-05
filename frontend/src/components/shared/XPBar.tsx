import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const XPBar = ({
  currentXP,
  maxXP,
  level,
  showLabel = true,
  size = 'md',
  className,
}: XPBarProps) => {
  const percentage = Math.min((currentXP / maxXP) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground font-rajdhani">
            Nivel {level}
          </span>
          <span className="text-xs font-orbitron text-accent">
            {currentXP} / {maxXP} XP
          </span>
        </div>
      )}
      <div
        className={cn(
          'relative w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(45 100% 60%) 100%)',
            boxShadow: '0 0 10px hsl(var(--accent) / 0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
};
