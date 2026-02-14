import { useState } from 'react';
import { Layout } from './Layout';
import { Timer } from './components/Timer';

const App = () => {
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
            <Timer />
        </Layout>
    );
};

export default App;
