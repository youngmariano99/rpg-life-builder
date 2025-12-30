import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { questSchema, QuestFormData } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { IRole } from '@/types';
import { Sword, Zap, CalendarDays, CalendarRange, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface CreateQuestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuestFormData) => Promise<void>;
  roles: IRole[];
}

const FREQUENCIES = [
  { value: 'daily', label: 'Diaria', icon: CalendarDays, description: 'Se reinicia cada día' },
  { value: 'weekly', label: 'Semanal', icon: CalendarRange, description: 'Se reinicia cada lunes' },
  { value: 'monthly', label: 'Mensual', icon: Calendar, description: 'Se reinicia el día 1' },
];

export const CreateQuestForm = ({
  open,
  onOpenChange,
  onSubmit,
  roles,
}: CreateQuestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: '',
      description: '',
      role_id: '',
      xp_reward: 50,
      frequency: 'daily',
    },
  });

  const handleSubmit = async (data: QuestFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: '¡Misión creada!',
        description: `"${data.title}" añadida a tus misiones`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la misión',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === form.watch('role_id'));
  const RoleIcon = selectedRole
    ? (LucideIcons as any)[selectedRole.icon] || LucideIcons.Star
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl text-foreground flex items-center gap-2">
            <Sword className="h-5 w-5 text-accent" />
            Nueva Misión
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crea un hábito gamificado para ganar XP
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Título de la Misión</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Ejercicio matutino, Leer 20 páginas..."
                      className="bg-muted/50 border-border focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales de la misión..."
                      className="bg-muted/50 border-border focus:border-primary resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Rol asociado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted/50 border-border">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {roles.map((role) => {
                        const Icon = (LucideIcons as any)[role.icon] || LucideIcons.Star;
                        return (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <Icon className={cn('h-4 w-4', `text-${role.color}`)} />
                              <span>{role.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Lvl {role.level}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Frequency */}
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Frecuencia</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {FREQUENCIES.map((freq) => (
                        <motion.button
                          key={freq.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => field.onChange(freq.value)}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-all duration-200',
                            field.value === freq.value
                              ? 'border-primary bg-primary/20'
                              : 'border-border bg-muted/30 hover:border-primary/50'
                          )}
                        >
                          <freq.icon className={cn(
                            'h-5 w-5 mx-auto mb-1',
                            field.value === freq.value ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          <div className={cn(
                            'text-sm font-medium',
                            field.value === freq.value ? 'text-primary' : 'text-foreground'
                          )}>
                            {freq.label}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* XP Reward */}
            <FormField
              control={form.control}
              name="xp_reward"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel className="text-foreground">Recompensa XP</FormLabel>
                    <span className="font-orbitron text-accent font-bold">
                      +{field.value} XP
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      min={10}
                      max={500}
                      step={10}
                      value={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">
                    Más XP = mayor dificultad/importancia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {form.watch('title') && selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-accent/30 bg-accent/5"
              >
                <div className="text-xs text-muted-foreground mb-2">Vista previa</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-muted-foreground/30" />
                    <div>
                      <div className="font-rajdhani font-semibold text-foreground">
                        {form.watch('title')}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {RoleIcon && <RoleIcon className="h-3 w-3" />}
                        {selectedRole.name}
                      </div>
                    </div>
                  </div>
                  <div className="font-orbitron text-sm text-accent">
                    +{form.watch('xp_reward')} XP
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-orbitron"
              >
                {isSubmitting ? 'Creando...' : 'Crear Misión'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
