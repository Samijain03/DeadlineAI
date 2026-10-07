import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RedesignApp from './redesign/App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RedesignApp />
    </AuthProvider>
  </StrictMode>,
)
