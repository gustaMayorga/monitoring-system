import { createBrowserRouter } from 'react-router-dom';
import MainLayout from "../components/Layout/MainLayout";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import CameraMonitorPage from "../pages/Cameras/CameraMonitorPage";
import AlertsPage from "../pages/Alerts/AlertsPage";
import ClientsPage from "../pages/Clients/ClientsPage";
import CompaniesPage from "../pages/Companies/CompaniesPage";
import InventoryPage from "../pages/Inventory/InventoryPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import SchedulePage from "../pages/Schedule/SchedulePage";
import SettingsPage from "../pages/Settings/SettingsPage";
import TestApp from "../pages/Test/TestApp";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'cameras',
        element: <CameraMonitorPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'clients',
        element: <ClientsPage />,
      },
      {
        path: 'companies',
        element: <CompaniesPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'test',
        element: <TestApp />,
      },
    ],
  },
]);