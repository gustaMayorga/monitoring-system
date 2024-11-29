// src/pages/Automation/ConditionEditor.tsx
const ConditionEditor: React.FC<{
    condition?: Condition;
    onSave: (condition: Condition) => void;
    onCancel: () => void;
  }> = ({ condition, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Condition>(condition || {
      field: '',
      operator: 'equals',
      value: ''
    });
  
    return (
      <Dialog open onOpenChange={() => onCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {condition ? 'Editar Condición' : 'Nueva Condición'}
            </DialogTitle>
          </DialogHeader>
  
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Campo
              </label>
              <Select
                value={formData.field}
                onValueChange={(value) => setFormData({
                  ...formData,
                  field: value
                })}
              >
                <option value="eventCode">Código de Evento</option>
                <option value="zone">Zona</option>
                <option value="priority">Prioridad</option>
                <option value="type">Tipo</option>
              </Select>
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1">
                Operador
              </label>
              <Select
                value={formData.operator}
                onValueChange={(value) => setFormData({
                  ...formData,
                  operator: value as Condition['operator']
                })}
              >
                <option value="equals">Igual a</option>
                <option value="contains">Contiene</option>
                <option value="greaterThan">Mayor que</option>
                <option value="lessThan">Menor que</option>
                <option value="between">Entre</option>
              </Select>
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor
              </label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({
                  ...formData,
                  value: e.target.value
                })}
              />
            </div>
  
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {condition ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };