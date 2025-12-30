import { ITimeBlock } from '@/types';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Focus, Coffee, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeBlockAgendaProps {
  timeBlocks: ITimeBlock[];
}

export const TimeBlockAgenda = ({ timeBlocks }: TimeBlockAgendaProps) => {
  const periods = [
    { id: 'morning', label: 'Mañana', icon: Sun, color: 'text-accent' },
    { id: 'afternoon', label: 'Tarde', icon: Sunset, color: 'text-primary' },
    { id: 'evening', label: 'Noche', icon: Moon, color: 'text-secondary' },
  ];

  const blockTypeIcons: Record<string, any> = {
    focus: Focus,
    rest: Coffee,
    admin: Briefcase,
  };

  const blockTypeColors: Record<string, string> = {
    focus: 'border-primary/50 bg-primary/5',
    rest: 'border-success/50 bg-success/5',
    admin: 'border-muted-foreground/50 bg-muted/30',
  };

  const getBlocksByPeriod = (period: string) =>
    timeBlocks
      .filter((block) => block.day_period === period)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-6">
      {periods.map((period, periodIndex) => {
        const blocks = getBlocksByPeriod(period.id);
        const PeriodIcon = period.icon;

        return (
          <motion.div
            key={period.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: periodIndex * 0.1 }}
          >
            {/* Period Header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  'p-2 rounded-lg bg-muted/50 border border-border/50',
                  period.color
                )}
              >
                <PeriodIcon className="h-5 w-5" />
              </div>
              <h3 className="font-orbitron text-lg font-semibold text-foreground">
                {period.label}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            {/* Time Blocks */}
            <div className="space-y-2 pl-6 border-l-2 border-border/30 ml-4">
              {blocks.length > 0 ? (
                blocks.map((block, index) => {
                  const BlockIcon = blockTypeIcons[block.block_type] || Focus;

                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: periodIndex * 0.1 + index * 0.05 }}
                      className={cn(
                        'relative p-4 rounded-lg border transition-all duration-200',
                        'hover:translate-x-1',
                        blockTypeColors[block.block_type]
                      )}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[1.65rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-border border-2 border-background" />

                      <div className="flex items-start gap-3">
                        <BlockIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-rajdhani font-semibold text-foreground truncate">
                              {block.title}
                            </h4>
                            <span className="text-xs font-orbitron text-muted-foreground whitespace-nowrap">
                              {block.start_time} - {block.end_time}
                            </span>
                          </div>
                          {block.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {block.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-4 text-sm text-muted-foreground italic">
                  Sin bloques programados
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
