import type { FC, ReactNode } from 'react';


interface LayoutProps {
    timerSlot: ReactNode;
    settingsSlot: ReactNode;
    statsSlot: ReactNode;
    activeView: 'settings' | 'timer' | 'stats';
    onViewChange: (view: 'settings' | 'timer' | 'stats') => void;
}

export const Layout: FC<LayoutProps> = ({
    timerSlot,
    settingsSlot,
    statsSlot,
    activeView,
    onViewChange
}) => {
    // We can use a ref to programmatically scroll on mobile if needed, 
    // but for now we rely on CSS scroll snap and let the user swipe.
    // The 'activeView' prop might be used for the bottom nav indicator or buttons.

    const scrollToView = (viewId: string) => {
        const el = document.getElementById(viewId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col md:overflow-hidden relative">

            {/* Mobile Swipe Container / Desktop Grid Container */}
            <main className="flex-1 w-full h-full relative overflow-hidden">

                {/* Desktop Grid Layout (Hidden on Mobile) */}
                <div className="hidden md:grid md:grid-cols-3 h-full gap-8 p-8 max-w-7xl mx-auto">
                    {/* Settings Panel */}
                    <section className="bg-surface-light/50 dark:bg-white/5 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 overflow-y-auto">
                        {settingsSlot}
                    </section>

                    {/* Main Timer Panel (Center) */}
                    <section className="flex flex-col items-center justify-center p-6">
                        {timerSlot}
                    </section>

                    {/* Stats Panel */}
                    <section className="bg-surface-light/50 dark:bg-white/5 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 overflow-y-auto">
                        {statsSlot}
                    </section>
                </div>

                {/* Mobile Swipe Layout (Hidden on Desktop) */}
                <div className="md:hidden snap-container h-full">
                    {/* Settings View (Left) */}
                    <section id="view-settings" className="snap-section p-6 pt-12 overflow-y-auto scroll-smooth">
                        {settingsSlot}
                        <div className="mt-auto pt-8 pb-20">
                            {/* Mobile Footer in Settings */}
                            <Footer />
                        </div>
                    </section>

                    {/* Timer View (Center - Default) */}
                    <section id="view-timer" className="snap-section p-6 items-center justify-center">
                        {timerSlot}
                    </section>

                    {/* Stats View (Right) */}
                    <section id="view-stats" className="snap-section p-6 pt-12 overflow-y-auto">
                        {statsSlot}
                    </section>
                </div>

                {/* Mobile Page Indicators / Nav (Optional, helpful for discovery) */}
                <div className="md:hidden absolute bottom-20 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                    <button
                        onClick={() => { scrollToView('view-settings'); onViewChange('settings'); }}
                        className={`pointer-events-auto h-2 w-2 rounded-full transition-all ${activeView === 'settings' ? 'bg-primary w-4' : 'bg-black/10'}`}
                        aria-label="Settings"
                    />
                    <button
                        onClick={() => { scrollToView('view-timer'); onViewChange('timer'); }}
                        className={`pointer-events-auto h-2 w-2 rounded-full transition-all ${activeView === 'timer' ? 'bg-primary w-4' : 'bg-black/10'}`}
                        aria-label="Timer"
                    />
                    <button
                        onClick={() => { scrollToView('view-stats'); onViewChange('stats'); }}
                        className={`pointer-events-auto h-2 w-2 rounded-full transition-all ${activeView === 'stats' ? 'bg-primary w-4' : 'bg-black/10'}`}
                        aria-label="Stats"
                    />
                </div>

            </main>

            {/* Desktop Footer (Fixed Bottom) */}
            <div className="hidden md:block absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <Footer />
            </div>

        </div>
    );
};

const Footer = () => (
    <p className="text-xs font-medium text-text-light/50 dark:text-text-dark/50 pointer-events-auto">
        Made by <a href="https://sami.codes" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Sami</a>
    </p>
);
