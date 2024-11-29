// src/pages/Cameras/CameraGrid.tsx
const CameraGrid: React.FC = () => {
    const [cameras, setCameras] = useState<any[]>([]);
    const [layout, setLayout] = useState<'2x2' | '3x3' | '4x4'>('2x2');
    const [events, setEvents] = useState<CameraEvent[]>([]);
  
    useEffect(() => {
      const loadCameras = async () => {
        try {
          const response = await camerasService.getAllCameras();
          setCameras(response);
        } catch (error) {
          console.error('Error loading cameras:', error);
        }
      };
  
      loadCameras();
    }, []);
  
    const handleCameraEvent = (event: CameraEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 50));
    };
  
    return (
      <div className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Monitoreo de Cámaras</h1>
          <div className="space-x-2">
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as any)}
              className="border rounded p-2"
            >
              <option value="2x2">2x2</option>
              <option value="3x3">3x3</option>
              <option value="4x4">4x4</option>
            </select>
          </div>
        </div>
  
        <div className="grid gap-4">
          <div className={`grid gap-4 ${
            layout === '2x2' ? 'grid-cols-2' :
            layout === '3x3' ? 'grid-cols-3' :
            'grid-cols-4'
          }`}>
            {cameras.map(camera => (
              <CameraViewer
                key={camera.id}
                cameraId={camera.id}
                name={camera.name}
                streamUrl={camera.streamUrl}
                onEvent={handleCameraEvent}
              />
            ))}
          </div>
  
          {/* Panel de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto">
                {events.map(event => (
                  <div key={event.id} className="py-2 border-b">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Cámara: {cameras.find(c => c.id === event.cameraId)?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.type === 'motion' && 'Movimiento detectado'}
                      {event.type === 'object_detected' && `Objeto detectado: ${event.details.object}`}
                      {event.type === 'connection_lost' && 'Conexión perdida'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  export default CameraGrid;