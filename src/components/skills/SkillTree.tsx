import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ISkill } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Zap, Clock, DollarSign } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SkillTreeProps {
  skills: ISkill[];
  onUnlockSkill: (skillId: string) => Promise<void>;
}

// Custom node component
const SkillNode = ({ data }: { data: any }) => {
  const skill: ISkill = data.skill;
  const IconComponent = (LucideIcons as any)[skill.icon] || LucideIcons.Star;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative p-4 rounded-xl border-2 min-w-[140px] max-w-[180px] cursor-pointer transition-all duration-300',
        skill.is_unlocked
          ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
          : skill.is_available
          ? 'border-accent bg-accent/10 animate-pulse shadow-[0_0_15px_hsl(var(--accent)/0.3)]'
          : 'border-muted bg-muted/30 opacity-60'
      )}
      onClick={() => data.onSelect(skill)}
    >
      {/* Lock indicator */}
      <div className="absolute -top-2 -right-2">
        {skill.is_unlocked ? (
          <div className="p-1 rounded-full bg-primary text-primary-foreground">
            <Unlock className="h-3 w-3" />
          </div>
        ) : skill.is_available ? (
          <div className="p-1 rounded-full bg-accent text-accent-foreground">
            <Zap className="h-3 w-3" />
          </div>
        ) : (
          <div className="p-1 rounded-full bg-muted text-muted-foreground">
            <Lock className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Icon */}
      <div
        className={cn(
          'mx-auto mb-2 p-2 rounded-lg w-fit',
          skill.is_unlocked
            ? 'bg-primary/20 text-primary'
            : skill.is_available
            ? 'bg-accent/20 text-accent'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <IconComponent className="h-6 w-6" />
      </div>

      {/* Name */}
      <h4 className="font-orbitron text-xs font-semibold text-center text-foreground truncate">
        {skill.name}
      </h4>

      {/* Cost */}
      {!skill.is_unlocked && (
        <div className="mt-2 flex justify-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Zap className="h-3 w-3 text-accent" />
            {skill.cost_xp}
          </span>
          {skill.cost_money && (
            <span className="flex items-center gap-0.5">
              <DollarSign className="h-3 w-3 text-success" />
              {skill.cost_money}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

const nodeTypes = {
  skill: SkillNode,
};

export const SkillTree = ({ skills, onUnlockSkill }: SkillTreeProps) => {
  const [selectedSkill, setSelectedSkill] = useState<ISkill | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Convert skills to nodes
  const initialNodes: Node[] = skills.map((skill) => ({
    id: skill.id,
    type: 'skill',
    position: { x: skill.position_x, y: skill.position_y },
    data: { skill, onSelect: setSelectedSkill },
    draggable: false,
  }));

  // Create edges from parent relationships
  const initialEdges: Edge[] = skills
    .filter((skill) => skill.parent_skill_id)
    .map((skill) => ({
      id: `${skill.parent_skill_id}-${skill.id}`,
      source: skill.parent_skill_id!,
      target: skill.id,
      type: 'smoothstep',
      style: {
        stroke: skill.is_unlocked
          ? 'hsl(var(--primary))'
          : skill.is_available
          ? 'hsl(var(--accent))'
          : 'hsl(var(--muted))',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: skill.is_unlocked
          ? 'hsl(var(--primary))'
          : skill.is_available
          ? 'hsl(var(--accent))'
          : 'hsl(var(--muted))',
      },
    }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when skills change
  useEffect(() => {
    setNodes(
      skills.map((skill) => ({
        id: skill.id,
        type: 'skill',
        position: { x: skill.position_x, y: skill.position_y },
        data: { skill, onSelect: setSelectedSkill },
        draggable: false,
      }))
    );
    setEdges(
      skills
        .filter((skill) => skill.parent_skill_id)
        .map((skill) => ({
          id: `${skill.parent_skill_id}-${skill.id}`,
          source: skill.parent_skill_id!,
          target: skill.id,
          type: 'smoothstep',
          style: {
            stroke: skill.is_unlocked
              ? 'hsl(var(--primary))'
              : skill.is_available
              ? 'hsl(var(--accent))'
              : 'hsl(var(--muted))',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: skill.is_unlocked
              ? 'hsl(var(--primary))'
              : skill.is_available
              ? 'hsl(var(--accent))'
              : 'hsl(var(--muted))',
          },
        }))
    );
  }, [skills, setNodes, setEdges]);

  const handleUnlock = async () => {
    if (!selectedSkill || !selectedSkill.is_available || selectedSkill.is_unlocked)
      return;

    setIsUnlocking(true);
    try {
      await onUnlockSkill(selectedSkill.id);
      setSelectedSkill(null);
    } catch (error) {
      console.error('Error desbloqueando habilidad:', error);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="relative h-[500px] w-full rounded-xl border border-border bg-card/30 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--muted))"
        />
        <Controls
          className="bg-card border-border"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Skill Detail Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 w-72 p-4 rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-xl"
          >
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-muted"
            >
              <LucideIcons.X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              {(() => {
                const Icon =
                  (LucideIcons as any)[selectedSkill.icon] || LucideIcons.Star;
                return (
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                );
              })()}
              <div>
                <h3 className="font-orbitron font-semibold text-foreground">
                  {selectedSkill.name}
                </h3>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    selectedSkill.is_unlocked
                      ? 'text-primary'
                      : selectedSkill.is_available
                      ? 'text-accent'
                      : 'text-muted-foreground'
                  )}
                >
                  {selectedSkill.is_unlocked
                    ? 'DESBLOQUEADA'
                    : selectedSkill.is_available
                    ? 'DISPONIBLE'
                    : 'BLOQUEADA'}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {selectedSkill.description}
            </p>

            {/* Costs */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">Costo XP:</span>
                <span className="font-orbitron font-semibold text-accent">
                  {selectedSkill.cost_xp}
                </span>
              </div>
              {selectedSkill.cost_money && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Inversión:</span>
                  <span className="font-orbitron font-semibold text-success">
                    ${selectedSkill.cost_money}
                  </span>
                </div>
              )}
              {selectedSkill.cost_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Tiempo:</span>
                  <span className="font-orbitron font-semibold text-primary">
                    {selectedSkill.cost_time}
                  </span>
                </div>
              )}
            </div>

            {/* Unlock Button */}
            {selectedSkill.is_available && !selectedSkill.is_unlocked && (
              <Button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-orbitron"
              >
                {isUnlocking ? 'Desbloqueando...' : 'Desbloquear Habilidad'}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
