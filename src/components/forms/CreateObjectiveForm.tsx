import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { objectiveSchema, ObjectiveFormData } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { IRole } from '@/types';
import { Trophy, CalendarIcon, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface CreateObjectiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ObjectiveFormData) => Promise<void>;
  roles: IRole[];
}

const QUARTERS = [
  { value: 'Q1', label: 'T1 - Invierno', months: 'Enero - Marzo' },
  { value: 'Q2', label: 'T2 - Primavera', months: 'Abril - Junio' },
  { value: 'Q3', label: 'T3 - Verano', months: 'Julio - Septiembre' },
  { value: 'Q4', label: 'T4 - Otoño', months: 'Octubre - Diciembre' },
];

export const CreateObjectiveForm = ({
  open,
  onOpenChange,
  onSubmit,
  roles,
}: CreateObjectiveFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const form = useForm<ObjectiveFormData>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      title: '',
      description: '',
      role_id: undefined,
      quarter: 'Q1',
      year: currentYear,
      xp_reward: 1500,
      deadline: undefined,
    },
  });

  const handleSubmit = async (data: ObjectiveFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: '¡Objetivo creado!',
        description: `"${data.title}" añadido como jefe trimestral`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el objetivo',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === form.watch('role_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Nuevo Objetivo Trimestral
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Define una batalla épica (Boss Battle) para este trimestre
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
                  <FormLabel className="text-foreground">Nombre del Objetivo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Lanzar MVP, Correr maratón..."
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
                  <FormLabel className="text-foreground">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe en detalle qué significa completar este objetivo..."
                      className="bg-muted/50 border-border focus:border-primary resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role and Quarter Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Role Selection (Optional) */}
              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Rol (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-muted/50 border-border">
                          <SelectValue placeholder="Ninguno" />
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

              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Año</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        {[currentYear, currentYear + 1, currentYear + 2].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quarter Selection */}
            <FormField
              control={form.control}
              name="quarter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Trimestre</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {QUARTERS.map((quarter) => (
                        <motion.button
                          key={quarter.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => field.onChange(quarter.value)}
                          className={cn(
                            'p-2 rounded-lg border text-center transition-all duration-200',
                            field.value === quarter.value
                              ? 'border-primary bg-primary/20'
                              : 'border-border bg-muted/30 hover:border-primary/50'
                          )}
                        >
                          <div className={cn(
                            'font-orbitron text-sm font-bold',
                            field.value === quarter.value ? 'text-primary' : 'text-foreground'
                          )}>
                            {quarter.value}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {quarter.months.split(' - ')[0]}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-foreground">Fecha Límite</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal bg-muted/50 border-border',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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
                      +{field.value.toLocaleString()} XP
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      min={500}
                      max={10000}
                      step={100}
                      value={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">
                    Los objetivos trimestrales otorgan grandes cantidades de XP
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {form.watch('title') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-secondary/30 bg-secondary/5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-secondary uppercase tracking-wider mb-1">
                      {form.watch('quarter')} {form.watch('year')} - Jefe Final
                    </div>
                    <div className="font-orbitron font-semibold text-foreground">
                      {form.watch('title')}
                    </div>
                    {selectedRole && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Asociado a: {selectedRole.name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Trophy className="h-6 w-6 text-accent mb-1" />
                    <div className="font-orbitron text-sm text-accent">
                      +{form.watch('xp_reward').toLocaleString()}
                    </div>
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
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-orbitron"
              >
                {isSubmitting ? 'Creando...' : 'Crear Objetivo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
