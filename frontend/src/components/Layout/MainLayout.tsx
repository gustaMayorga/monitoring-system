// src/components/Layout/MainLayout.tsx
import { Outlet, Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Sistema de Monitoreo</h1>
        </div>
        <nav className="mt-4">
          <Link to="/" className="block px-4 py-2 hover:bg-slate-700">
            Dashboard
          </Link>
          <Link to="/clients" className="block px-4 py-2 hover:bg-slate-700">
            Clientes
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout