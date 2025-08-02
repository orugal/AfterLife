import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Route, Routes, BrowserRouter } from 'react-router'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NotificationManager from './components/NotificationManager.jsx'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <NotificationManager />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
