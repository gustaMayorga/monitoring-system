// src/pages/Automation/RuleEditor.tsx
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const RuleEditor: React.FC<RuleEditorProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Rule>>(rule || {
    name: '',
    description: '',
    eventType: 'alarm',
    conditions: [],
    actions: [],
    enabled: true,
    priority: 1
  });

  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [showActionEditor, setShowActionEditor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Rule);
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Editar Regla' : 'Nueva Regla'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre de la Regla
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value
                })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({
                  ...formData,
                  description: e.target.value
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Evento
              </label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({
                  ...formData,
                  eventType: value as Rule['eventType']
                })}
              >
                <option value="alarm">Alarma</option>
                <option value="camera">Cámara</option>
                <option value="system">Sistema</option>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Habilitada</label>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  enabled: checked
                })}
              />
            </div>
          </div>

          {/* Condiciones */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Condiciones</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConditionEditor(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Condición
              </Button>
            </div>

            <div className="space-y-2">
              {formData.conditions?.map((condition, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <span className="font-medium">{condition.field}</span>
                    <span className="mx-2">{condition.operator}</span>
                    <span>{condition.value}</span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Editar condición */}}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          conditions: formData.conditions?.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Acciones</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowActionEditor(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Acción
              </Button>
            </div>

            <div className="space-y-2">
              {formData.actions?.map((action, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <span className="font-medium capitalize">
                      {action.type.replace('_', ' ')}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {action.config.template || action.config.url || 'Sin configuración'}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Editar acción */}}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          actions: formData.actions?.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {rule ? 'Guardar Cambios' : 'Crear Regla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};