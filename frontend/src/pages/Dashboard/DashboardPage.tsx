// src/pages/Dashboard/DashboardPage.tsx
const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 grid-cols-3">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold mb-2">Total Clientes</h2>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold mb-2">Cámaras Activas</h2>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold mb-2">Alertas Hoy</h2>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage