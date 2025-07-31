import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Route, Routes, BrowserRouter } from 'react-router'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter> 
  </StrictMode>,
)
