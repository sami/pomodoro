import { useState } from 'react';
import { Layout } from './components/Layout/Layout';

/* ──────────────────────────────
   Dark-mode helper
   ────────────────────────────── */
function useDarkMode() {
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains('dark'),
    );
    const toggle = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark((d) => !d);
    };
    return { isDark, toggle };
}

/* ──────────────────────────────
   Settings Panel (demo)
   ────────────────────────────── */
const SettingsPanel = ({
    isDark,
    onToggleDark,
}: {
    isDark: boolean;
    onToggleDark: () => void;
}) => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold">Settings</h2>

        {/* Dark-mode toggle */}
        <div className="flex items-center justify-between rounded-2xl bg-background p-4">
            <span className="text-sm font-semibold">Dark Mode</span>
            <button
                onClick={onToggleDark}
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${
                    isDark ? 'bg-primary' : 'bg-muted'
                }`}
            >
                <span
                    className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                        isDark ? 'translate-x-5' : ''
                    }`}
                />
            </button>
        </div>

        {/* Placeholder rows */}
        {['Focus Duration', 'Short Break', 'Long Break'].map((label) => (
            <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-background p-4"
            >
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-sm font-bold text-primary">25 min</span>
            </div>
        ))}
    </div>
);

/* ──────────────────────────────
   Timer Panel (demo)
   ────────────────────────────── */
const TimerPanel = () => {
    const [running, setRunning] = useState(false);

    return (
        <div className="flex flex-col items-center gap-8">
            {/* Ring */}
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-[6px] border-primary-light">
                <div
                    className={`absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin [animation-duration:3s] ${
                        running ? '' : '[animation-play-state:paused]'
                    }`}
                />
                <span className="tabular-nums text-6xl font-extrabold tracking-tight">
                    25:00
                </span>
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                Focus Time
            </span>

            <button
                onClick={() => setRunning((r) => !r)}
                className="rounded-full bg-primary px-10 py-3.5 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:bg-primary-hover active:scale-95"
            >
                {running ? 'Pause' : 'Start'}
            </button>
        </div>
    );
};

/* ──────────────────────────────
   Stats Panel (demo)
   ────────────────────────────── */
const StatsPanel = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold">History</h2>

        {[
            { label: 'Today', sessions: 4, minutes: 100 },
            { label: 'Yesterday', sessions: 6, minutes: 150 },
            { label: 'This Week', sessions: 22, minutes: 550 },
        ].map(({ label, sessions, minutes }) => (
            <div key={label} className="space-y-1 rounded-2xl bg-background p-4">
                <p className="text-sm font-semibold">{label}</p>
                <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{sessions} sessions</span>
                    <span>·</span>
                    <span>{minutes} min</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min((sessions / 8) * 100, 100)}%` }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* ──────────────────────────────
   App
   ────────────────────────────── */
const App = () => {
    const { isDark, toggle } = useDarkMode();

    return (
        <Layout
            settingsSlot={<SettingsPanel isDark={isDark} onToggleDark={toggle} />}
            timerSlot={<TimerPanel />}
            statsSlot={<StatsPanel />}
        />
    );
};

export default App;
