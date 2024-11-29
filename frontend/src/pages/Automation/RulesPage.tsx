  // src/pages/Automation/RulesPage.tsx
  const RulesPage: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | undefined>();
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      loadRules();
    }, []);
  
    const loadRules = async () => {
      try {
        const response = await fetch('/api/automation/rules');
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error('Error loading rules:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleSaveRule = async (rule: Rule) => {
      try {
        const method = rule.id ? 'PUT' : 'POST';
        const url = rule.id 
          ? `/api/automation/rules/${rule.id}`
          : '/api/automation/rules';
  
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(rule)
        });
  
        if (!response.ok) throw new Error('Error saving rule');
  
        loadRules();
        setShowEditor(false);
        setEditingRule(undefined);
      } catch (error) {
        console.error('Error saving rule:', error);
      }
    };
  
    const handleDeleteRule = async (ruleId: string) => {
      if (!confirm('¿Estás seguro de eliminar esta regla?')) return;
  
      try {
        const response = await fetch(`/api/automation/rules/${ruleId}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) throw new Error('Error deleting rule');
  
        loadRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    };
  
    const handleToggleRule = async (ruleId: string, enabled: boolean) => {
      try {
        const response = await fetch(`/api/automation/rules/${ruleId}/toggle`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ enabled })
        });
  
        if (!response.ok) throw new Error('Error toggling rule');
  
        loadRules();
      } catch (error) {
        console.error('Error toggling rule:', error);
      }
    };
  
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reglas de Automatización</h1>
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
  
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {rules.map(rule => (
              <Card key={rule.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingRule(rule);
                        setShowEditor(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    {rule.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Condiciones</h4>
                      <div className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-sm">
                            {condition.field} {condition.operator} {condition.value}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Acciones</h4>
                      <div className="space-y-1">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="text-sm">
                            {action.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
  
        {showEditor && (
          <RuleEditor
            rule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => {
              setShowEditor(false);
              setEditingRule(undefined);
            }}
          />
        )}
      </div>
    );
  };
  
  export default RulesPage;