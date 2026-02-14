import { useState } from 'react';
import { Layout } from './Layout';

const App = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const toggleDark = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark((prev) => !prev);
    };

    return (
        <Layout
            settingsContent={
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <button
                        onClick={toggleDark}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 transition hover:bg-white/20"
                    >
                        Toggle {isDark ? 'Light' : 'Dark'} Mode
                    </button>
                    <div className="text-xs text-white/60">
                        Minimal settings placeholder
                    </div>
                </div>
            }
            historyContent={
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">History</h2>
                    {['Deep Work', 'Short Focus', 'Evening Sprint'].map((item) => (
                        <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                            {item}
                        </div>
                    ))}
                </div>
            }
        >
            <div className="flex flex-col items-center gap-6">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-4 border-primary/30">
                    <div
                        className={`absolute inset-0 rounded-full border-4 border-primary border-t-transparent ${
                            isRunning ? 'animate-spin' : ''
                        }`}
                    />
                    <span className="text-5xl font-semibold tracking-tight">25:00</span>
                </div>

                <input
                    type="text"
                    placeholder="What will you focus on?"
                    className="w-72 max-w-[80vw] rounded-full border border-black/10 bg-white/80 px-5 py-3 text-center text-sm text-text-main shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-white/10 dark:text-white"
                />

                <button
                    onClick={() => setIsRunning((prev) => !prev)}
                    className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                >
                    {isRunning ? 'Pause' : 'Start Focus'}
                </button>
            </div>
        </Layout>
    );
};

export default App;
