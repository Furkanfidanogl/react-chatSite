import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {  HashRouter } from 'react-router-dom'
import { AppContextProvider } from './context/Context.jsx'

createRoot(document.getElementById('root')).render(
    <HashRouter>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </HashRouter>
)
