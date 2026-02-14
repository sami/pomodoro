import { useState, useEffect } from 'react';
import { Layout } from './components/Layout/Layout';
import { Timer } from './components/Timer/Timer';
import { Settings } from './components/Settings/Settings';
import { HistoryView } from './components/History/HistoryView';
import { ReloadPrompt } from './components/PWA/ReloadPrompt';

const App = () => {
    const [activeView, setActiveView] = useState<'settings' | 'timer' | 'stats'>('timer');

    useEffect(() => {
        // Scroll handling for mobile swipe detection
        const handleScroll = () => {
            const container = document.querySelector('.snap-container');
            if (!container) return;

            const scrollLeft = container.scrollLeft;
            const width = container.clientWidth;
            const page = Math.round(scrollLeft / width);

            if (page === 0) setActiveView('settings');
            if (page === 1) setActiveView('timer');
            if (page === 2) setActiveView('stats');
        };

        const container = document.querySelector('.snap-container');
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Initial scroll to center (Timer)
            // Need a slight delay to ensure layout
            setTimeout(() => {
                container.scrollTo({ left: container.clientWidth, behavior: 'instant' });
            }, 50);
        }

        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Layout
                activeView={activeView}
                onViewChange={setActiveView}
                timerSlot={<Timer />}
                settingsSlot={<Settings />}
                statsSlot={<HistoryView />}
            />
            <ReloadPrompt />
        </>
    );
};

export default App;
