// src/pages/Automation/ActionEditor.tsx
const ActionEditor: React.FC<{
    action?: Action;
    onSave: (action: Action) => void;
    onCancel: () => void;
  }> = ({ action, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Action>(action || {
      type: 'notification',
      config: {}
    });
  
    const renderConfigFields = () => {
      switch (formData.type) {
        case 'notification':
          return (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template
                </label>
                <Select
                  value={formData.config.template}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    config: { ...formData.config, template: value }
                  })}
                >
                  <option value="intrusion_alert">Alerta de Intrusión</option>
                  <option value="system_alert">Alerta de Sistema</option>
                  <option value="camera_alert">Alerta de Cámara</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prioridad
                </label>
                <Select
                  value={formData.config.priority}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    config: { ...formData.config, priority: value }
                  })}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </Select>
              </div>
            </>
          );
  
        case 'email':
          return (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Destinatarios
                </label>
                <Input
                  type="text"
                  placeholder="email1@ejemplo.com, email2@ejemplo.com"
                  value={formData.config.recipients?.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      recipients: e.target.value.split(',').map(e => e.trim())
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Asunto
                </label>
                <Input
                  value={formData.config.subject}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, subject: e.target.value }
                  })}
                />
              </div>
            </>
          );
  
        case 'camera_record':
          return (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cámara
                </label>
                <Select
                  value={formData.config.cameraId}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    config: { ...formData.config, cameraId: value }
                  })}
                >
                  <option value="camera1">Cámara 1</option>
                  <option value="camera2">Cámara 2</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duración (segundos)
                </label>
                <Input
                  type="number"
                  value={formData.config.duration}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, duration: parseInt(e.target.value) }
                  })}
                />
              </div>
            </>
          );
  
        case 'webhook':
          return (
            <div>
              <label className="block text-sm font-medium mb-1">
                URL del Webhook
              </label>
              <Input
                type="url"
                value={formData.config.url}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, url: e.target.value }
                })}
                placeholder="https://ejemplo.com/webhook"
              />
            </div>
          );
      }
    };
  
    return (
      <Dialog open onOpenChange={() => onCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action ? 'Editar Acción' : 'Nueva Acción'}
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
                Tipo de Acción
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({
                  ...formData,
                  type: value as Action['type'],
                  config: {} // Reset config when changing type
                })}
              >
                <option value="notification">Notificación</option>
                <option value="email">Email</option>
                <option value="camera_record">Grabar Cámara</option>
                <option value="webhook">Webhook</option>
              </Select>
            </div>
  
            {renderConfigFields()}
  
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {action ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  