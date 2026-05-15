import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DeviceList from './pages/DeviceList'
import DeviceDetail from './pages/DeviceDetail'
import AlertManagement from './pages/AlertManagement'
import MonitorCenter from './pages/MonitorCenter'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="devices" element={<DeviceList />} />
        <Route path="devices/:id" element={<DeviceDetail />} />
        <Route path="alerts" element={<AlertManagement />} />
        <Route path="monitor" element={<MonitorCenter />} />
      </Route>
    </Routes>
  )
}

export default App
