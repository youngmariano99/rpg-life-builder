import { useState } from 'react';
import { motion } from 'framer-motion';
import { IObjective, ICampaign, IInvestment } from '@/types';
import { Target, Trophy, Clock, CheckCircle2, AlertCircle, DollarSign, BookOpen, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CampaignMapProps {
  campaign: ICampaign;
  objectives: IObjective[];
  investments: IInvestment[];
}

export const CampaignMap = ({ campaign, objectives, investments }: CampaignMapProps) => {
  const [selectedQuarter, setSelectedQuarter] = useState<string>(campaign.quarter);

  const quarters = [
    { id: 'Q1', label: 'T1 - Invierno', months: 'Ene - Mar' },
    { id: 'Q2', label: 'T2 - Primavera', months: 'Abr - Jun' },
    { id: 'Q3', label: 'T3 - Verano', months: 'Jul - Sep' },
    { id: 'Q4', label: 'T4 - Otoño', months: 'Oct - Dic' },
  ];

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pendiente' },
    in_progress: { icon: Target, color: 'text-primary', label: 'En Progreso' },
    completed: { icon: CheckCircle2, color: 'text-success', label: 'Completado' },
    failed: { icon: AlertCircle, color: 'text-destructive', label: 'Fallido' },
  };

  const investmentTypeIcons: Record<string, any> = {
    money: DollarSign,
    course: BookOpen,
    tool: Wrench,
    time: Clock,
    other: Target,
  };

  const filteredObjectives = objectives.filter(
    (obj) => obj.quarter === selectedQuarter && obj.year === campaign.year
  );

  const completedCount = filteredObjectives.filter(
    (obj) => obj.status === 'completed'
  ).length;
  const totalProgress =
    filteredObjectives.length > 0
      ? (completedCount / filteredObjectives.length) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/50 text-primary">
              {campaign.quarter} {campaign.year}
            </Badge>
            <h2 className="font-orbitron text-2xl font-bold text-foreground mb-1">
              {campaign.name}
            </h2>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
          <div className="text-right">
            <Trophy className="h-10 w-10 text-accent mb-2" />
            <div className="font-orbitron text-sm text-muted-foreground">
              {completedCount}/{filteredObjectives.length} Jefes
            </div>
          </div>
        </div>

        {campaign.theme && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Tema de la Temporada
            </span>
            <p className="font-rajdhani text-lg text-foreground">{campaign.theme}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progreso de Campaña</span>
            <span className="font-orbitron text-primary">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>
      </motion.div>

      {/* Quarter Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {quarters.map((quarter) => (
          <motion.button
            key={quarter.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedQuarter(quarter.id)}
            className={cn(
              'flex-shrink-0 px-4 py-3 rounded-xl border transition-all duration-300',
              selectedQuarter === quarter.id
                ? 'border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                : 'border-border bg-card/50 hover:border-primary/50'
            )}
          >
            <div className="font-orbitron text-sm font-semibold text-foreground">
              {quarter.label}
            </div>
            <div className="text-xs text-muted-foreground">{quarter.months}</div>
          </motion.button>
        ))}
      </div>

      {/* Objectives Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredObjectives.length > 0 ? (
          filteredObjectives.map((objective, index) => {
            const status = statusConfig[objective.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={objective.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative p-5 rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300',
                  objective.status === 'in_progress'
                    ? 'border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
                    : objective.status === 'completed'
                    ? 'border-success/50'
                    : 'border-border/50 hover:border-primary/30'
                )}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      'border-current',
                      status.color
                    )}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                {/* Content */}
                <div className="pr-24">
                  <h3 className="font-orbitron text-lg font-semibold text-foreground mb-2">
                    {objective.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {objective.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="text-sm text-muted-foreground">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Fecha límite: {new Date(objective.deadline).toLocaleDateString('es-ES')}
                  </div>
                  <div className="font-orbitron text-sm font-bold text-accent">
                    +{objective.xp_reward} XP
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No hay objetivos para este trimestre</p>
          </div>
        )}
      </div>

      {/* Investments Section */}
      {investments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-6"
        >
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Inversiones Planificadas
          </h3>

          <div className="space-y-3">
            {investments.map((investment) => {
              const TypeIcon = investmentTypeIcons[investment.type] || Target;

              return (
                <div
                  key={investment.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-rajdhani font-semibold text-foreground truncate">
                      {investment.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{investment.type}</span>
                      {investment.amount && (
                        <span className="font-orbitron text-success">
                          ${investment.amount}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      investment.status === 'completed'
                        ? 'border-success/50 text-success'
                        : investment.status === 'in_progress'
                        ? 'border-primary/50 text-primary'
                        : 'border-muted-foreground/50 text-muted-foreground'
                    )}
                  >
                    {investment.status === 'completed'
                      ? 'Completado'
                      : investment.status === 'in_progress'
                      ? 'En Curso'
                      : 'Planificado'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
