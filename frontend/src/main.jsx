import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LegacyApp from './App.jsx'
import RedesignApp from './redesign/App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {new URLSearchParams(window.location.search).get('legacy') === '1' ? <LegacyApp /> : <RedesignApp />}
    </AuthProvider>
  </StrictMode>,
)
