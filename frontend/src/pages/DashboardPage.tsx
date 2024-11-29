import { useState, useEffect } from 'react'

interface DashboardStats {
  totalClients: number
  activeClients: number
  inactiveClients: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0
  })

  useEffect(() => {
    // Aquí podrías cargar estadísticas reales desde tu API
    const loadStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    // Por ahora, usamos datos de ejemplo
    setStats({
      totalClients: 150,
      activeClients: 120,
      inactiveClients: 30
    })
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Clientes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Clientes Activos</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeClients}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Clientes Inactivos</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactiveClients}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Actividad Reciente</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm">Nuevo cliente registrado: Juan Pérez</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm">Actualización de cliente: María García</p>
                <p className="text-xs text-gray-500">Hace 3 horas</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm">Cliente inactivado: Carlos López</p>
                <p className="text-xs text-gray-500">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 