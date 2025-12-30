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
import { roleSchema, RoleFormData } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import {
  Code2,
  Heart,
  Dumbbell,
  TrendingUp,
  BookOpen,
  Palette,
  Users,
  Briefcase,
  Music,
  Gamepad2,
  Plane,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = [
  { name: 'Code2', icon: Code2 },
  { name: 'Heart', icon: Heart },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Palette', icon: Palette },
  { name: 'Users', icon: Users },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Music', icon: Music },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Plane', icon: Plane },
  { name: 'Star', icon: Star },
];

const COLORS = [
  { name: 'primary', label: 'Cyan', class: 'bg-primary' },
  { name: 'secondary', label: 'Violeta', class: 'bg-secondary' },
  { name: 'destructive', label: 'Rojo', class: 'bg-destructive' },
  { name: 'success', label: 'Verde', class: 'bg-success' },
  { name: 'accent', label: 'Dorado', class: 'bg-accent' },
];

interface CreateRoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  existingRolesCount: number;
}

export const CreateRoleForm = ({
  open,
  onOpenChange,
  onSubmit,
  existingRolesCount,
}: CreateRoleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: 'primary',
    },
  });

  const handleSubmit = async (data: RoleFormData) => {
    if (existingRolesCount >= 7) {
      toast({
        title: 'Límite alcanzado',
        description: 'No puedes tener más de 7 roles activos',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: '¡Nuevo rol creado!',
        description: `${data.name} se ha añadido a tu hoja de personaje`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el rol',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedIcon = ICONS.find((i) => i.name === form.watch('icon'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Crear Nueva Clase
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Define un nuevo rol para tu aventura ({existingRolesCount}/7 roles)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nombre del Rol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Desarrollador, Atleta, Padre..."
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
                      placeholder="Describe este aspecto de tu vida..."
                      className="bg-muted/50 border-border focus:border-primary resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon Selection */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Icono</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-6 gap-2">
                      {ICONS.map(({ name, icon: Icon }) => (
                        <motion.button
                          key={name}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => field.onChange(name)}
                          className={cn(
                            'p-3 rounded-lg border transition-all duration-200',
                            field.value === name
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
                          )}
                        >
                          <Icon className="h-5 w-5 mx-auto" />
                        </motion.button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      {COLORS.map((color) => (
                        <motion.button
                          key={color.name}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => field.onChange(color.name)}
                          className={cn(
                            'w-10 h-10 rounded-full border-2 transition-all duration-200',
                            color.class,
                            field.value === color.name
                              ? 'border-foreground ring-2 ring-offset-2 ring-offset-background ring-primary'
                              : 'border-transparent hover:border-foreground/50'
                          )}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {form.watch('name') && selectedIcon && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-primary/30 bg-primary/5"
              >
                <div className="text-xs text-muted-foreground mb-2">Vista previa</div>
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', `bg-${form.watch('color')}/20`)}>
                    <selectedIcon.icon className={cn('h-6 w-6', `text-${form.watch('color')}`)} />
                  </div>
                  <div>
                    <div className="font-orbitron font-semibold text-foreground">
                      {form.watch('name')}
                    </div>
                    <div className="text-xs text-muted-foreground">Nivel 1</div>
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
                disabled={isSubmitting || existingRolesCount >= 7}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-orbitron"
              >
                {isSubmitting ? 'Creando...' : 'Crear Clase'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
