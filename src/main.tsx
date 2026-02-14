import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { SoundProvider } from './context/SoundContext';
import { TasksProvider } from './hooks/useTasks';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SoundProvider>
            <TasksProvider>
                <App />
            </TasksProvider>
        </SoundProvider>
    </StrictMode>
);
