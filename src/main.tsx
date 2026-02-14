import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/global.css'
import App from './App.tsx'
import { TimerProvider } from './context/TimerContext.tsx'
import { SoundProvider } from './context/SoundContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SoundProvider>
            <TimerProvider>
                <App />
            </TimerProvider>
        </SoundProvider>
    </StrictMode>,
)
