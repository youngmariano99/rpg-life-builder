import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, User, Map, TreeDeciduous, 
  Menu, X, Sparkles, Flame, Target, Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleCard } from '@/components/roles/RoleCard';
import { QuestItem } from '@/components/quests/QuestItem';
import { TimeBlockAgenda } from '@/components/dashboard/TimeBlockAgenda';
import { SkillTree } from '@/components/skills/SkillTree';
import { CampaignMap } from '@/components/campaign/CampaignMap';
import { XPBar } from '@/components/shared/XPBar';
import { LevelUpAnimation } from '@/components/shared/XPAnimation';
import { 
  getDashboardData, 
  getSkillsByRole, 
  getObjectives, 
  getInvestments,
  completeQuest,
  unlockSkill,
} from '@/services/api';
import { DashboardData, IRole, ISkill, IObjective, IInvestment } from '@/types';
import { cn } from '@/lib/utils';

type View = 'dashboard' | 'roles' | 'campaign' | 'skills';

const Index = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [roleSkills, setRoleSkills] = useState<ISkill[]>([]);
  const [objectives, setObjectives] = useState<IObjective[]>([]);
  const [investments, setInvestments] = useState<IInvestment[]>([]);
  const [mainGoal, setMainGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
        
        const [objs, invs] = await Promise.all([
          getObjectives(),
          getInvestments(),
        ]);
        setObjectives(objs);
        setInvestments(invs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load skills when role is selected
  useEffect(() => {
    const loadSkills = async () => {
      if (selectedRole) {
        const skills = await getSkillsByRole(selectedRole.id);
        setRoleSkills(skills);
        setView('skills');
      }
    };

    if (selectedRole) {
      loadSkills();
    }
  }, [selectedRole]);

  const handleQuestComplete = useCallback(async (questId: string) => {
    const result = await completeQuest(questId);
    
    if (result.leveledUp && data) {
      const role = data.roles.find(r => r.id === result.quest.role_id);
      if (role) {
        setShowLevelUp(role.level + 1);
      }
    }

    // Refresh data
    const dashboardData = await getDashboardData();
    setData(dashboardData);
  }, [data]);

  const handleUnlockSkill = useCallback(async (skillId: string) => {
    await unlockSkill(skillId);
    
    // Refresh skills
    if (selectedRole) {
      const skills = await getSkillsByRole(selectedRole.id);
      setRoleSkills(skills);
    }
  }, [selectedRole]);

  const navItems = [
    { id: 'dashboard', label: 'Cuartel General', icon: Sword },
    { id: 'roles', label: 'Hoja de Personaje', icon: User },
    { id: 'campaign', label: 'Mapa de Campaña', icon: Map },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="p-4 rounded-full border-2 border-primary border-t-transparent"
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error al cargar datos</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpAnimation
            level={showLevelUp}
            onComplete={() => setShowLevelUp(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-2 rounded-lg bg-primary/10 border border-primary/30"
              >
                <Sword className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="font-orbitron text-lg font-bold text-foreground">
                  Life RPG
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Planner
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={view === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setView(item.id as View);
                    setSelectedRole(null);
                  }}
                  className={cn(
                    'font-rajdhani',
                    view === item.id && 'bg-primary text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* User Stats */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="font-orbitron text-sm font-bold text-foreground">
                  {data.user.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  Nivel {data.user.level}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-primary/50"
              >
                <span className="font-orbitron text-lg font-bold text-white">
                  {data.user.level}
                </span>
              </motion.div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-sm"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={view === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setView(item.id as View);
                      setSelectedRole(null);
                      setIsMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section - Main Goal */}
              <section className="text-center py-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-foreground mb-2">
                    ¿Cuál es tu misión de hoy?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Define la cosa más importante que harás
                  </p>
                  <div className="relative">
                    <Input
                      value={mainGoal}
                      onChange={(e) => setMainGoal(e.target.value)}
                      placeholder="Ej: Terminar el módulo de autenticación"
                      className="h-14 text-lg text-center font-rajdhani bg-card/50 border-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                    />
                    <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
                  </div>
                </motion.div>
              </section>

              {/* Stats Row */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Racha Actual', value: data.stats.current_streak, icon: Flame, color: 'text-accent' },
                  { label: 'Misiones Hoy', value: `${data.todayQuests.filter(q => q.is_completed).length}/${data.todayQuests.length}`, icon: Target, color: 'text-primary' },
                  { label: 'XP Total', value: data.stats.total_xp_earned.toLocaleString(), icon: Sparkles, color: 'text-accent' },
                  { label: 'Horas Enfocadas', value: data.stats.hours_focused, icon: Clock, color: 'text-success' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="cyber-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon className={cn('h-8 w-8', stat.color)} />
                      <div>
                        <div className="font-orbitron text-2xl font-bold text-foreground">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </section>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Daily Quests */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-orbitron text-xl font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Misiones Diarias
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {data.todayQuests.map((quest) => {
                      const role = data.roles.find(r => r.id === quest.role_id);
                      return (
                        <QuestItem
                          key={quest.id}
                          quest={quest}
                          role={role}
                          onComplete={handleQuestComplete}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Time Blocks */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-orbitron text-xl font-semibold text-foreground flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Agenda del Día
                    </h3>
                  </div>
                  <div className="cyber-card p-4">
                    <TimeBlockAgenda timeBlocks={data.timeBlocks} />
                  </div>
                </section>
              </div>

              {/* Active Campaign Preview */}
              {data.activeCampaign && (
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cyber-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-primary uppercase tracking-wider mb-1">
                        Campaña Activa
                      </div>
                      <h3 className="font-orbitron text-xl font-bold text-foreground">
                        {data.activeCampaign.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.activeCampaign.theme}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setView('campaign')}
                      className="border-primary/50 hover:border-primary hover:bg-primary/10"
                    >
                      Ver Mapa
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}

          {/* Roles View */}
          {view === 'roles' && (
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Hoja de Personaje
                </h2>
                <p className="text-muted-foreground">
                  Tus clases activas y su progreso
                </p>
              </div>

              {/* User Level */}
              <div className="max-w-md mx-auto">
                <XPBar
                  currentXP={data.user.total_xp % 1000}
                  maxXP={1000}
                  level={data.user.level}
                  size="lg"
                />
              </div>

              {/* Role Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <RoleCard
                      role={role}
                      onClick={() => setSelectedRole(role)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Skills View */}
          {view === 'skills' && selectedRole && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Back Button & Title */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(null);
                    setView('roles');
                  }}
                  className="border-primary/50"
                >
                  ← Volver
                </Button>
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
                    <TreeDeciduous className="h-6 w-6 text-primary" />
                    Árbol de Habilidades
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedRole.name} - Nivel {selectedRole.level}
                  </p>
                </div>
              </div>

              {/* Skill Tree */}
              <SkillTree
                skills={roleSkills}
                onUnlockSkill={handleUnlockSkill}
              />
            </motion.div>
          )}

          {/* Campaign View */}
          {view === 'campaign' && data.activeCampaign && (
            <motion.div
              key="campaign"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Mapa de Campaña
                </h2>
                <p className="text-muted-foreground">
                  Planificación trimestral y objetivos
                </p>
              </div>

              <CampaignMap
                campaign={data.activeCampaign}
                objectives={objectives}
                investments={investments}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-rajdhani">
            Life RPG Planner © {new Date().getFullYear()} — Tu vida, tu aventura
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
