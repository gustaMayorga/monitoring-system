import React, { useState } from 'react';

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Después:
// Eliminar todas las importaciones anteriores y dejar solo una
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Switch,
  Label,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';

// ... resto del código
  
  // El resto del código permanece igual...
interface AnalysisRule {
  type: 'presence' | 'crossing' | 'loitering';
  objectTypes: string[];
  duration?: number;
  direction?: 'in' | 'out' | 'both';
  schedule?: {
    days: number[];
    startTime: string;
    endTime: string;
  };
}

interface AnalysisConfig {
  enableMotionDetection: boolean;
  motionSensitivity: number;
  enableObjectDetection: boolean;
  objectClasses: string[];
  minConfidence: number;
  regions?: {
    name: string;
    points: { x: number; y: number }[];
    rules?: AnalysisRule[];
  }[];
}

interface ConfigurationPanelProps {
  cameraId: string;
  currentConfig: AnalysisConfig;
  onConfigUpdate: (config: AnalysisConfig) => void;
}

export default function ConfigurationPanel({
  cameraId,
  currentConfig,
  onConfigUpdate
}: ConfigurationPanelProps) {
  const [config, setConfig] = useState<AnalysisConfig>(currentConfig);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleConfigChange = (changes: Partial<AnalysisConfig>) => {
    const newConfig = { ...config, ...changes };
    setConfig(newConfig);
  };

  const handleRuleChange = (regionName: string, ruleIndex: number, changes: Partial<AnalysisRule>) => {
    const newConfig = { ...config };
    const region = newConfig.regions?.find(r => r.name === regionName);
    if (region && region.rules) {
      region.rules[ruleIndex] = { ...region.rules[ruleIndex], ...changes };
      setConfig(newConfig);
    }
  };

  const addRule = (regionName: string) => {
    const newConfig = { ...config };
    const region = newConfig.regions?.find(r => r.name === regionName);
    if (region) {
      if (!region.rules) region.rules = [];
      region.rules.push({
        type: 'presence',
        objectTypes: ['person'],
        duration: 5
      });
      setConfig(newConfig);
    }
  };

  const saveConfig = () => {
    onConfigUpdate(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Detección de Movimiento */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Detección de Movimiento</Label>
              <p className="text-sm text-gray-500">Activar detección de movimiento</p>
            </div>
            <Switch
              checked={config.enableMotionDetection}
              onCheckedChange={(checked) =>
                handleConfigChange({ enableMotionDetection: checked })
              }
            />
          </div>

          {/* Sensibilidad de Movimiento */}
          {config.enableMotionDetection && (
            <div className="space-y-2">
              <Label>Sensibilidad</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[config.motionSensitivity]}
                  onValueChange={(value) =>
                    handleConfigChange({ motionSensitivity: value[0] })
                  }
                  min={1}
                  max={100}
                  step={1}
                />
                <span className="w-12 text-sm">{config.motionSensitivity}%</span>
              </div>
            </div>
          )}

          {/* Detección de Objetos */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Detección de Objetos</Label>
              <p className="text-sm text-gray-500">Activar detección de objetos</p>
            </div>
            <Switch
              checked={config.enableObjectDetection}
              onCheckedChange={(checked) =>
                handleConfigChange({ enableObjectDetection: checked })
              }
            />
          </div>

          {/* Clases de Objetos */}
          {config.enableObjectDetection && (
            <div className="space-y-2">
              <Label>Clases de Objetos</Label>
              <Select
                value={config.objectClasses.join(',')}
                onValueChange={(value) =>
                  handleConfigChange({ objectClasses: value.split(',') })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar objetos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person,vehicle">Personas y Vehículos</SelectItem>
                  <SelectItem value="person">Solo Personas</SelectItem>
                  <SelectItem value="vehicle">Solo Vehículos</SelectItem>
                  <SelectItem value="person,vehicle,animal">Todos los Objetos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Confianza Mínima */}
          <div className="space-y-2">
            <Label>Confianza Mínima</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[config.minConfidence * 100]}
                onValueChange={(value) =>
                  handleConfigChange({ minConfidence: value[0] / 100 })
                }
                min={0}
                max={100}
                step={1}
              />
              <span className="w-12 text-sm">{Math.round(config.minConfidence * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regiones de Detección */}
      <Card>
        <CardHeader>
          <CardTitle>Regiones de Detección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedRegion || ''}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar región" />
            </SelectTrigger>
            <SelectContent>
              {config.regions?.map((region) => (
                <SelectItem key={region.name} value={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRegion && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Reglas de la Región</h3>
                {config.regions
                  ?.find((r) => r.name === selectedRegion)
                  ?.rules?.map((rule, index) => (
                    <div key={index} className="space-y-2 mt-2">
                      <Select
                        value={rule.type}
                        onValueChange={(value) =>
                          handleRuleChange(selectedRegion, index, {
                            type: value as 'presence' | 'crossing' | 'loitering',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de regla" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presence">Presencia</SelectItem>
                          <SelectItem value="crossing">Cruce de Línea</SelectItem>
                          <SelectItem value="loitering">Merodeo</SelectItem>
                        </SelectContent>
                      </Select>

                      {rule.type === 'loitering' && (
                        <div className="space-y-2">
                          <Label>Duración (segundos)</Label>
                          <Input
                            type="number"
                            value={rule.duration || 0}
                            onChange={(e) =>
                              handleRuleChange(selectedRegion, index, {
                                duration: parseInt(e.target.value),
                              })
                            }
                            min={1}
                          />
                        </div>
                      )}

                      {/* Programación */}
                      <div className="space-y-2">
                        <Label>Horario</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            value={rule.schedule?.startTime || '00:00'}
                            onChange={(e) =>
                              handleRuleChange(selectedRegion, index, {
                                schedule: {
                                  ...rule.schedule,
                                  startTime: e.target.value,
                                  days: rule.schedule?.days || [1,2,3,4,5],
                                  endTime: rule.schedule?.endTime || '23:59'
                                },
                              })
                            }
                          />
                          <Input
                            type="time"
                            value={rule.schedule?.endTime || '23:59'}
                            onChange={(e) =>
                              handleRuleChange(selectedRegion, index, {
                                schedule: {
                                  ...rule.schedule,
                                  endTime: e.target.value,
                                  days: rule.schedule?.days || [1,2,3,4,5],
                                  startTime: rule.schedule?.startTime || '00:00'
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRule(selectedRegion)}
                  className="mt-2"
                >
                  Agregar Regla
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setConfig(currentConfig)}>
          Cancelar
        </Button>
        <Button onClick={saveConfig}>
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}