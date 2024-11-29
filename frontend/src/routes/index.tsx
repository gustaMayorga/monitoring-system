// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/components/Layout/MainLayout'
import DashboardPage from '@/pages/Dashboard/DashboardPage'
import ClientPage from '@/pages/client/ClientsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: '/client',
        element: <ClientPage />
      }
    ]
  }
])