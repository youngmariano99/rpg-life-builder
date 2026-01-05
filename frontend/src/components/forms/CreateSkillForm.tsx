import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ISkill } from '@/types';

interface CreateSkillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  roleId: string;
  existingSkills: ISkill[]; // Necesario para elegir el "Padre"
}

export const CreateSkillForm = ({
  open,
  onOpenChange,
  onSubmit,
  roleId,
  existingSkills,
}: CreateSkillFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_xp: 100,
    cost_money: 0,
    parent_skill_id: 'root', // 'root' significa que es habilidad base
    icon: 'Star',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Preparamos los datos
      const payload = {
        role_id: roleId,
        name: formData.name,
        description: formData.description,
        cost_xp: Number(formData.cost_xp),
        cost_money: Number(formData.cost_money),
        cost_time: '0', // Default
        icon: formData.icon,
        parent_skill_id: formData.parent_skill_id === 'root' ? null : formData.parent_skill_id,
        // Lógica simple de posición para que no se encimen (puedes mejorarla luego)
        position_x: formData.parent_skill_id === 'root' ? 250 : 250,
        position_y: formData.parent_skill_id === 'root' ? 50 : 200, 
      };

      await onSubmit(payload);
      onOpenChange(false);
      setFormData({ // Reset form
        name: '',
        description: '',
        cost_xp: 100,
        cost_money: 0,
        parent_skill_id: 'root',
        icon: 'Star',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-foreground">Nueva Habilidad</DialogTitle>
          <DialogDescription>
            Define una nueva capacidad para este rol.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Habilidad</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Programación Básica"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Requisito (Habilidad Padre)</Label>
            <Select
              value={formData.parent_skill_id}
              onValueChange={(val) => setFormData({ ...formData, parent_skill_id: val })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecciona requisito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">-- Sin requisito (Raíz) --</SelectItem>
                {existingSkills.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="xp">Costo XP</Label>
              <Input
                id="xp"
                type="number"
                min="0"
                required
                value={formData.cost_xp}
                onChange={(e) => setFormData({ ...formData, cost_xp: Number(e.target.value) })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="money">Costo Dinero ($)</Label>
              <Input
                id="money"
                type="number"
                min="0"
                value={formData.cost_money}
                onChange={(e) => setFormData({ ...formData, cost_money: Number(e.target.value) })}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="¿Qué permite hacer esta habilidad?"
              className="bg-background"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Habilidad
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};