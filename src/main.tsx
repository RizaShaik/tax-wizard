import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './store/AuthContext.tsx'
import { TaxProvider } from './store/TaxContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <TaxProvider>
                <App />
            </TaxProvider>
        </AuthProvider>
    </React.StrictMode>,
)
